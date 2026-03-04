# PRD: design styles - UI/UX Framework
1. Executive Summary
Project: Football Management Education Sim

Goal: To knit together three distinct visual styles—High-Density Data, Social Messaging, and Isometric Tycoon—into a unified "OS" where mathematical literacy is the primary gameplay mechanic.

2. Core Architecture (The Three Pillars)
A. The Command Center (Default State)
Purpose: The central "Home" for squad management and league standing.

Design Philosophy: "NASA for Football." High-density, professional, and dark-themed.

Key Feature: The "Squad Audit" table using monospaced fonts for perfect numerical alignment.

B. The Social Feed (Narrative Layer)
Purpose: The engine for "Discussions," transfer negotiations, and press.

Design Philosophy: Mobile-first messaging (WhatsApp/Twitter style).

Key Feature: The "Negotiation Keyboard"—a numeric-focused input for solving arithmetic challenges.

C. The Isometric Blueprint (Expansion Layer)
Purpose: Visual reward system for financial success.

Design Philosophy: SNES-style SimCity / Tycoon. Bright, vibrant, and tactile.

Key Feature: Building overlays that require geometry or ROI calculations to "unlock" construction.

3. Design Tokens (The Style Dictionary)
3.1 Color Palette
--bg-deep-space: #0B1622 (Dashboard Background)

--bg-surface: #1B2635 (Card/Widget Background)

--neon-data: #00F5D4 (Correct Math / Success / Positive Trends)

--alert-coral: #FF5A5F (Math Error / Debt / Warnings)

--chat-bubble: #F0F2F5 (NPC Message Background - Social Feed)

--pitch-green: #4CAF50 (Isometric Grass / Stadium Ground)

3.2 Typography
Headings/UI Labels: Inter or Sans-Serif (Weight: 600 for Headers, 400 for Labels).

Data & Stats: JetBrains Mono or Roboto Mono (Mandatory for tables/math input).

Narrative Text: SF Pro or System Sans-Serif.

3.3 Spacing & Geometry
Base Grid: 4px (All margins/padding must be multiples of 4).

Border Radius: 4px (Small tags), 12px (Widgets), 20px (Chat Bubbles).

Isometric Grid: 64px x 32px tiles (2:1 ratio).

4. Sectional Design Guidelines
4.1 The Hub (Command Center)
Layout: 12-column grid. Left-fixed sidebar (80px collapsed, 240px expanded).

Visual Rule: No "pure white" text. Use Slate-100 or Off-white to prevent eye-strain.

Component: Data Tiles must include a sparkline or trend arrow next to math-based stats.

4.2 The Chat (Social Feed)
Layout: Vertical flexbox. Chat bubbles should not exceed 70% of screen width.

State Change: When a math challenge is active, the chat input field must expand and display a neon-data glow.

Animation: Use 300ms ease-in-out for new message bubbles.

4.3 The Build (Isometric Blueprint)
Layout: Fixed 45-degree isometric camera.

Visual Rule: Objects should have a 1px "pixel-art" style outline or a sharp low-poly edge.

Integration: Clicking a building triggers a "Blueprint Slide-over" from the right, using the Command Center aesthetic.

5. Technical Implementation Notes for LLM
Framework Suggestion: React with Tailwind CSS.

State Management: Ensure a global BusinessAcumen variable updates the UI theme.

Accessibility: Use aria-labels on all data-dense tables for screen readers.