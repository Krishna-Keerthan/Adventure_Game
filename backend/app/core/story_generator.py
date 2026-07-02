import json
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import asyncio

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.prompts import STORY_PROMPT, json_structure
from app.models.story import Story, StoryNode
from app.core.storyDtos import StoryLLMResponse, StoryNodeLLM

load_dotenv()


def repair_json(text: str) -> str:
    """
    Attempts to fix truncated or incomplete JSON by closing
    any unclosed braces and brackets.
    """
    text = text.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        parts = text.split("```")
        # parts[1] contains the fenced content
        text = parts[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    # Count unclosed braces and brackets and append the missing closers
    open_braces = text.count('{') - text.count('}')
    open_brackets = text.count('[') - text.count(']')

    # Close in reverse order (brackets before braces since they're inner)
    text += ']' * open_brackets
    text += '}' * open_braces

    return text


class StoryGenerator:

    @classmethod
    def _get_llm(cls):
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.8,
            max_tokens=4096
        )

    @classmethod
    def generate_story(cls, db: Session, session_id: str, theme: str = "fantasy") -> Story:
        llm = cls._get_llm()

        prompt = ChatPromptTemplate.from_messages([
            ("system", STORY_PROMPT),
            ("human", "Create a choose-your-own-adventure story with this theme: {theme}")
        ]).partial(json_structure=json_structure)

        chain = prompt | llm

        raw_response = chain.invoke({"theme": theme})
        response_text = raw_response.content if hasattr(raw_response, "content") else str(raw_response)

        # Attempt 1: parse as-is
        try:
            raw_dict = json.loads(response_text.strip())
        except json.JSONDecodeError:
            # Attempt 2: repair and retry
            try:
                repaired = repair_json(response_text)
                raw_dict = json.loads(repaired)
            except json.JSONDecodeError as e:
                raise ValueError(
                    f"LLM returned invalid JSON that could not be repaired: {e}"
                    f"\n\nRaw output:\n{response_text}"
                )

        # Validate the parsed dict into our Pydantic model
        try:
            story_structure = StoryLLMResponse.model_validate(raw_dict)
        except Exception as e:
            raise ValueError(f"JSON parsed but failed Pydantic validation: {e}")

        story_db = Story(title=story_structure.title, session_id=session_id)
        db.add(story_db)
        db.flush()

        cls._process_story_node(db, story_db.id, story_structure.rootNode, is_root=True)

        db.commit()
        return story_db

    @classmethod
    def _process_story_node(cls, db: Session, story_id: int, node_data: StoryNodeLLM, is_root: bool = False) -> StoryNode:
        node = StoryNode(
            story_id=story_id,
            content=node_data.content,
            is_root=is_root,
            is_ending=node_data.isEnding,
            is_winning_ending=node_data.isWinningEnding,
            options=[]
        )

        db.add(node)
        db.flush()

        if not node.is_ending and node_data.options:
            options_list = []
            for option_data in node_data.options:
                child_node = cls._process_story_node(db, story_id, option_data.nextNode, is_root=False)
                options_list.append({
                    "text": option_data.text,
                    "node_id": child_node.id
                })
            node.options = options_list

        db.flush()
        return node
    

    @classmethod
    async def generate_story_async(cls, db: Session , session_id: str, theme: str) -> Story:
        loop = asyncio.get_event_loop()
        story = await loop.run_in_executor(
            None,
            cls.generate_story,
            db,
            session_id,
            theme
        )

        return story