This directory contains modified version of react-arborist v3.4.3 (https://github.com/brimdata/react-arborist).
It worked generally great, but there were several issues that made me clone the repo and modify the source. Specifically:

- Migrated from react-window to Virtuoso (Since it's already used, avoid adding excessive dependencies)
- Fixed broken outer-drop-hook. (It showed the cursor, but didn't actually move anything)
- Fixed cursor behaviour:
    - For empty nodes, cursor can only highlight the entire node, not the first position inside it
    - Horizontal drop position now constrained more accurately, depending on the tree structure;
- Removed all default components. They are overriden anyways;
- Removed simple tree;
- Also, for custom inputs I needed some private API, so cloning the source code made even more sense;
- TODO: Allow DND from node library outside.