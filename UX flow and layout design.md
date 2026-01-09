# 📱 UX Flow & Layout Design

## Overview

This document defines the user experience flow, screen layouts, and visual design guidelines for the Keno gaming platform. The design prioritizes **mobile-first** approach with fast, intuitive gameplay.

---

## 📱 Core UI Screens

The platform includes the following screens:

1. ✅ **Home / Game Lobby** - Entry point with game tile
2. ✅ **Main Keno Game Screen** - Primary gameplay interface
3. ✅ **Bet Slip & Confirmation** - Bet placement and confirmation
4. ✅ **Round Result Overlay** - Win/loss feedback
5. ✅ **History & Fairness Verification** - Past rounds and provably fair verification
6. ✅ **Tutorial / First-time Onboarding** - New player guidance
7. ✅ **Operator Branding Theme** - Customizable operator branding

---

## 🧭 Main Game Layout (Mobile-First)

### Layout Structure

The main game screen is divided into three sections:

#### **Top Section**

| Element | Description |
|---------|-------------|
| **Operator Logo** | Branded logo display |
| **Balance** | Player balance from wallet |
| **Current Round ID** | Active round identifier |
| **Countdown Timer** | Time remaining until draw |
| **Language Switcher** | Quick language selection |

#### **Middle Section**

| Element | Description |
|---------|-------------|
| **Number Grid** | Interactive grid of numbers 1–80 |
| **Interaction** | Tap to select/unselect numbers |
| **Clear All Button** | Reset all selections |
| **Auto-Pick Button** | Random number selection |

**Visual Indicators**:
- ✅ Selected state highlighting
- ✅ Color-blind safe highlighting
- ✅ Clear visual feedback

#### **Bottom Section**

**Bet Controls**:

| Element | Description |
|---------|-------------|
| **Bet Amount Selector** | ± buttons and preset amounts |
| **Pick Quantity Indicator** | Display current selection count (e.g., "Pick 6") |
| **Potential Win Preview** | Estimated winnings display |
| **BET NOW Button** | Place bet action |

### Ticket Slip (After Bet Placement)

Once a bet is placed, a ticket slip appears showing:

- ✅ **Chosen Numbers** - Selected numbers highlighted
- ✅ **Stake** - Bet amount
- ✅ **Round ID** - Associated round
- ✅ **Status** - `Waiting` / `Locked` / `Result`

---

## ⚡ Fast Gameplay Flow

### Target Experience

Deliver **"fast perceived speed"** - players should feel the game is responsive and quick.

### Performance Optimizations

| Feature | Implementation |
|---------|----------------|
| **Quick Results Animation** | Numbers pop/highlight instantly |
| **Win Animation** | Smooth text & coins animation |
| **Auto-Repeat Option** | Quick bet same numbers in next round |
| **One-Tap Repeat** | Tap once to bet same numbers again |
| **Minimal Transitions** | Fast, smooth screen transitions |

> **Goal**: Players should **not wait** for long transitions or loading states.

---

## 🎨 Visual Style

### Design Principles

- 🎰 **Premium casino look** - High-quality, polished appearance
- 🌙 **Dark theme default** - Easy on eyes, battery-friendly
- ☀️ **Light theme optional** - User preference available
- 📦 **Rounded cards** - 2xl border radius for modern feel
- 💫 **Soft shadows** - Subtle depth and elevation
- ✨ **Glow effects** - Highlight hit numbers with glow
- 🔋 **Muted backgrounds** - Battery-efficient display

### Color Palette (Color-Blind Safe)

| State | Color | Usage |
|-------|-------|-------|
| **Hit Numbers** | Green ✓ | Numbers that matched draw |
| **Selected** | Blue | Player-selected numbers |
| **Unselected** | Gray | Available numbers |
| **Warning** | Orange/Yellow | Important messages |

> **Important**: Avoid **red/green only** contrast for accessibility.

---

## 🌍 Language & Localization UI

### Supported Languages

| Language | Code | Notes |
|----------|------|-------|
| English | `en` | Default |
| French | `fr` | |
| Spanish | `es` | |
| Portuguese | `pt` | |
| Arabic | `ar` | **RTL (Right-to-Left)** |
| Swahili | `sw` | |
| Amharic | `am` | |
| Tigrinya | `ti` | |
| Oromo | `om` | |

### Localization Features

- ✅ **RTL layout auto-flip** - Automatic right-to-left layout for Arabic
- ✅ **Number formatting by locale** - Regional number formatting
- ✅ **Currency symbol localization** - Currency displayed per region
- ✅ **JSON-based i18n** - Easy translation management

### Arabic (RTL) Mode

When Arabic is selected:

- 📐 Grid mirrors RTL orientation
- ⏱️ Timer aligns right
- 📝 Text flows RTL naturally
- 🔄 All UI elements flip appropriately

---

## 🧩 Auto-Pick Feature

### Functionality

**Player Action**: Tap "Auto-Pick" button

**System Behavior**:
- Randomly selects numbers for player
- **Default pick count**: 6 numbers
- **Configurable** - Player can set preferred count
- **Automatic duplicate prevention**

### Use Case

Useful for **quick gambling flow** - players can instantly place bets without manual selection.

---

## ♻️ Repeat Bet Feature

### Available Buttons

| Button | Action |
|--------|--------|
| **BET SAME** | Place same bet as previous round |
| **DOUBLE BET** | Double the stake with same numbers |
| **CLEAR** | Clear all selections and start fresh |

### Purpose

These features are **required for**:
- ⚡ **Fast play** - Quick consecutive betting
- 🔄 **High round frequency** - Support 5-second rounds

---

## 🥇 Win/Loss Feedback

### Win Case

When player wins:

1. ✅ **Highlight matched numbers** - Visual emphasis on hits
2. ✅ **Display win information**:
   - **HIT COUNT** - How many numbers matched
   - **MULTIPLIER** - Win multiplier applied
   - **WIN AMOUNT** - Total winnings
3. ✅ **Payout confirmation** - "Payout confirmed" tag after credit callback returns

**Visual Treatment**: 
- 🎉 Celebratory animation
- ✨ Glow effects on winning numbers
- 💰 Smooth win amount display

### Loss Case

When player loses:

- ✅ **Soft animation only** - Subtle, non-intrusive
- ✅ **Clear feedback**: "No win this round"
- ❌ **No aggressive messaging** - Preserves Responsible Gaming compliance

> **Responsible Gaming**: Loss messaging should be neutral and not encourage chasing losses.

---

## 🧾 History & Fairness Screen

### Purpose

Players can view their betting history and verify round fairness.

### Available Information

| Section | Content |
|---------|---------|
| **Past Rounds** | List of previous rounds |
| **Player Tickets** | All bets placed by player |
| **Fairness Verification** | Provably fair proof data |

### Fairness Verification Display

Shows:
- ✅ **Commit Hash** - Published before draw
- ✅ **Reveal Seed** - Published after draw
- ✅ **Verify Button** - Calls API to verify fairness
- ✅ **Drawn Numbers** - Complete draw results

### Benefits

This fulfills:
- 🔍 **Transparency expectations** - Players can verify fairness
- ✅ **Regulator friendliness** - Compliant with regulations
- 🛡️ **Trust building** - Builds player confidence

---

## 🎓 Tutorial / First Time User Experience

### Onboarding Popup

First-time players see a tutorial popup covering:

| Topic | Content |
|-------|---------|
| **How to Play** | Basic gameplay instructions |
| **Pick Numbers** | How many numbers to select (1-10) |
| **Prize Scaling** | How payouts work based on matches |
| **Responsible Gaming** | Reminder about responsible gambling |
| **Disclaimer** | Information about chance and odds |

### Features

- ✅ **Supports localization** - Available in all supported languages
- ✅ **Dismissible** - Can be closed and accessed later
- ✅ **Interactive** - Step-by-step guidance

---

## 🎛 Operator Branding System

### Customization Options

Operators may customize:

| Element | Description |
|---------|-------------|
| **Logo** | Operator brand logo |
| **Primary Colors** | Main brand color palette |
| **Secondary Colors** | Accent colors |
| **Background Texture** | Custom background patterns |
| **Bet Limit Display** | Show/hide betting limits |

### Isolation

> **Important**: Players **never see** other operators' branding or data. Complete multi-tenant isolation.

---

## Summary

This UX design provides:

- ✅ **Mobile-first responsive design** - Optimized for all devices
- ✅ **Fast, intuitive gameplay** - Quick bet placement and results
- ✅ **Accessible design** - Color-blind safe, RTL support
- ✅ **Multi-language support** - 9 languages with full localization
- ✅ **Transparent fairness** - Easy verification for players
- ✅ **Responsible gaming** - Compliance-focused messaging
- ✅ **Operator customization** - Flexible branding system
- ✅ **Premium casino experience** - High-quality visual design

The design prioritizes speed, accessibility, and trust-building while maintaining regulatory compliance.