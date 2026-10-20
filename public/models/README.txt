character.glb goes in this directory.

It is Anurag's own 3D character model (Tripo H3.1, generated from his
photo-based portrait), loaded at runtime by src/components/CharacterModel.tsx
via useGLTF("/models/character.glb"). If the file is absent, the hero's 3D
panel renders empty (error boundary) — the site itself keeps working.
