"""Module for testing docstring extraction."""

import os
import sys


def process_data(items: list) -> dict:
    """Process a list of items and return results.
    
    This is additional detail that should not appear.
    """
    return {}


class DataProcessor:
    """Handles complex data transformations."""

    def transform(self, data: dict) -> dict:
        """Apply transformation pipeline to data."""
        return data

    def _internal_method(self):
        """This is a private method."""
        pass


def _private_helper():
    """A private helper function."""
    pass


def no_docstring():
    pass


MAX_ITEMS = 1000
