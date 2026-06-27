from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class StoryOptionLLM(BaseModel):
    text: str = Field(description="The text of the option shown to the user.")
    # Fix: use StoryNodeLLM directly instead of Dict[str, Any]
    # Forward reference via string since StoryNodeLLM is defined below
    nextNode: StoryNodeLLM = Field(description="The next node content and its options.")


class StoryNodeLLM(BaseModel):
    content: str = Field(description="The node content.")
    isEnding: bool = Field(description="Whether this node is an ending node.")
    isWinningEnding: bool = Field(description="Whether this node is a winning ending node.")
    options: Optional[List[StoryOptionLLM]] = Field(default=None, description="The options for this node.")


class StoryLLMResponse(BaseModel):
    title: str = Field(description="The title of the story.")
    rootNode: StoryNodeLLM = Field(description="The root node of the story.")


# Required for Pydantic v2 to resolve the forward reference between
# StoryOptionLLM.nextNode and StoryNodeLLM
StoryOptionLLM.model_rebuild()
StoryNodeLLM.model_rebuild()