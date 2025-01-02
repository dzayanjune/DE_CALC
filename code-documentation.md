# Differential Equations Calculator Documentation

## Overview
A web application that solves differential equations for growth/decay and heating/cooling problems. Built with HTML, CSS, and vanilla JavaScript.

## Core Components

### Calculator Types
1. Growth/Decay Calculator
   - Finds amount at time t
   - Determines initial value
   - Calculates time for target amount
   
2. Heat/Cool Calculator
   - Determines temperature at time t
   - Finds initial temperature
   - Calculates time to reach target temperature

### Key Classes

#### BaseCalculator
- Base class for all calculators
- Handles solution storage and display
- Methods: addStep(), displaySolution()

#### UIManager
- Controls UI interactions and form displays
- Handles calculator type selection
- Manages dynamic form generation

#### Utils
- Temperature conversions (Kelvin/Celsius/Fahrenheit)
- Time normalization (seconds/minutes/hours)
- Input validation

## Implementation Details

### Growth/Decay Calculations
```javascript
// Core formula: x = ce^(kt)
k = ln(x1/x0)/t1
x2 = x0 * e^(k*t2)
```

### Heat/Cool Calculations
```javascript
// Newton's Law of Cooling/Heating
k = ln((T1 - Ta)/(T0 - Ta))/t1
T = Ta + (T0 - Ta) * e^(k*t)
```

### File Structure
- index.html: Main layout and structure
- script.js: Calculator logic and UI management
- style.css: Green-themed responsive styling

## Styling
- Responsive design (max-width: 768px)
- Color scheme: Green theme (#4CAF50, #2E7D32)
- Custom scrollbar and hover effects
- Card-based layout with shadows

## Usage

### Basic Flow
1. Select calculation type (Growth/Decay or Heat/Cool)
2. Choose specific calculation
3. Input required values
4. View step-by-step solution

### Example
```javascript
// Finding amount after time t
const calculator = new GrowthDecayCalculator();
calculator.findAmount({
    x0: initialValue,
    t1: time1,
    x1: amount1,
    t2: targetTime,
    unitX: "kg",
    unitT: "hours"
});
```
