// Utility functions
const utils = {
    toKelvin(value, unit) {
        const conversions = {
            'Celsius': val => val + 273.15,
            'Fahrenheit': val => (val - 32) * (5 / 9) + 273.15,
            'Kelvin': val => val
        };
        return conversions[unit](value);
    },

    fromKelvin(value, unit) {
        const conversions = {
            'Celsius': val => val - 273.15,
            'Fahrenheit': val => (val - 273.15) * (9 / 5) + 32,
            'Kelvin': val => val
        };
        return conversions[unit](value);
    },

    normalizeTime(value, unit) {
        const conversions = {
            'seconds': val => val / 3600,
            'minutes': val => val / 60,
            'hours': val => val
        };
        return conversions[unit](value);
    },

    denormalizeTime(value, unit) {
        const conversions = {
            'seconds': val => val * 3600,
            'minutes': val => val * 60,
            'hours': val => val
        };
        return conversions[unit](value);
    },

    validateNumericInputs(...inputs) {
        return inputs.every(input => {
            if (input === null || input === undefined) return false;
            
            // Convert to string and trim
            const stringValue = String(input).trim();
            
            // Check if empty
            if (stringValue === '') return false;
            
            // Convert to number
            const numValue = parseFloat(stringValue);
            
            // Check if it's a valid number
            return !isNaN(numValue) && isFinite(numValue);
        });
    }
};

// Calculator Factory
const CalculatorFactory = {
    create(type) {
        const calculators = {
            'growth-decay': GrowthDecayCalculator,
            'heat-cool': HeatCoolCalculator
        };
        return calculators[type];
    }
};

// Base Calculator
class BaseCalculator {
    constructor() {
        this.solution = [];
    }

    addStep(step) {
        this.solution.push(step);
    }

    displaySolution() {
        const solutionElement = document.getElementById("solution");
        const solutionSection = document.getElementById("solution-section");
        solutionElement.innerHTML = this.solution.join("<br>");
        solutionSection.classList.remove("hidden");
    }
}

// UI Management
class UIManager {
    static initEventListeners() {
        document.getElementById("proceed-button")?.addEventListener("click", () => {
            document.getElementById("welcome-section").classList.add("hidden");
            document.getElementById("options-section").classList.remove("hidden");
        });

        document.getElementById("start-button")?.addEventListener("click", this.startCalculator);
    }

    static startCalculator() {
        const calcType = document.getElementById("calc-type").value;
        const inputSection = document.getElementById("input-section");
        const inputForm = document.getElementById("input-form");

        inputForm.innerHTML = ""; 

        const templates = {
            'growth-decay': {
                options: [
                    { value: 'find-amount', label: 'Determine the amount of Growth or Decay at a given Time (t).' },
                    { value: 'find-initial', label: 'Determine the Initial Value (x₀).' },
                    { value: 'find-time', label: 'Determine the Time (t) for a given amount of x.' }
                ],
                nextAction: GrowthDecayUI.displayForm
            },
            'heat-cool': {
                options: [
                    { value: 'find-temp', label: 'Determine Temperature at Time' },
                    { value: 'find-initial-temp', label: 'Determine Initial Temperature' },
                    { value: 'find-time', label: 'Determine Time to Reach Temperature' }
                ],
                nextAction: HeatCoolUI.displayForm
            }
        };

        const config = templates[calcType];
        const selectElement = `
            <label>Select the Calculation Type:
                <select id="${calcType}-type">
                    ${config.options.map(option => 
                        `<option value="${option.value}">${option.label}</option>`
                    ).join('')}
                </select>
            </label>
            <button type="button" id="select-type-button">Next</button>
        `;

        inputForm.innerHTML = selectElement;
        document.getElementById("select-type-button").onclick = config.nextAction;
        inputSection.classList.remove("hidden");
    }
}

// Specialized UI Helpers
class GrowthDecayUI {
    static displayForm() {
        const selectedType = document.getElementById("growth-decay-type").value;
        const calculator = CalculatorFactory.create('growth-decay');
        const formTemplates = {
            'find-amount': { 
                fields: ['initial-value', 'time1', 'amount1', 'time2', 'unit-x', 'unit-time'],
                calculateMethod: 'findAmount',
                fieldLabels: {
                    'initial-value': 'Initial Value (x₀)',
                    'time1': 'First Time Point',
                    'amount1': 'First Amount',
                    'time2': 'Second Time Point',
                    'unit-x': 'Unit of Measurement',
                    'unit-time': 'Time Unit'
                }
            },
            'find-initial': {
                fields: ['amount1', 'time1', 'amount2', 'time2', 'unit-x', 'unit-time'],
                calculateMethod: 'findInitialValue',
                fieldLabels: {
                    'amount1': 'First Amount',
                    'time1': 'First Time Point',
                    'amount2': 'Second Amount',
                    'time2': 'Second Time Point',
                    'unit-x': 'Unit of Measurement',
                    'unit-time': 'Time Unit'
                }
            },
            'find-time': {
                fields: ['initial-value', 'amount1', 'time1', 'target-amount', 'unit-x', 'unit-time'],
                calculateMethod: 'findTime',
                fieldLabels: {
                    'initial-value': 'Initial Value (x₀)',
                    'amount1': 'First Amount',
                    'time1': 'First Time Point',
                    'target-amount': 'Target Amount',
                    'unit-x': 'Unit of Measurement',
                    'unit-time': 'Time Unit'
                }
            }
        };

        const template = formTemplates[selectedType];
        const inputForm = document.getElementById("input-form");
        
        const formHTML = `
            ${template.fields.map(field => `
                <div class="form-group">
                    <label for="${field}">${template.fieldLabels[field]}</label>
                    ${field === 'unit-x' || field === 'unit-time' ? 
                    GrowthDecayUI.renderUnitSelect(field) : 
                    `<input type="text" id="${field}" name="${field}" required>`
                }
                </div>
                `).join('')}
                <button type="button" id="calculate-button">Calculate</button>
                `;

        inputForm.innerHTML = formHTML;

        document.getElementById("calculate-button").onclick = () => {
            const inputs = {};
            template.fields.forEach(field => {
                inputs[GrowthDecayUI.convertFieldNameToKey(field)] = document.getElementById(field).value;
            });

            const calculatorInstance = new calculator();
            calculatorInstance[template.calculateMethod](inputs);
        };
    }

    static renderUnitSelect(field) {
        const units = {
            'unit-x': ['kg', 'g', 'mg', 'population', 'count'],
            'unit-time': ['seconds', 'minutes', 'hours', 'days']
        };
        
        return `
            <select id="${field}" name="${field}">
                ${units[field].map(unit => `<option value="${unit}">${unit}</option>`).join('')}
            </select>
        `;
    }

    static convertFieldNameToKey(field) {
        const mappings = {
            'initial-value': 'x0',
            'time1': 't1',
            'amount1': 'x1',
            'time2': 't2',
            'target-amount': 'x2',
            'unit-x': 'unitX',
            'unit-time': 'unitT'
        };
        return mappings[field] || field;
    }
}

// Growth/Decay Calculator
class GrowthDecayCalculator extends BaseCalculator {
    findAmount(inputs) {
        const { x0, t1, x1, t2, unitX, unitT } = inputs;
    
        // Convert inputs to numbers and check for valid numeric values
        const numX0 = parseFloat(x0);
        const numT1 = parseFloat(t1);
        const numX1 = parseFloat(x1);
        const numT2 = parseFloat(t2);
    
        // Validate inputs
        if (isNaN(numX0) || isNaN(numT1) || isNaN(numX1) || isNaN(numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
    
        const k = Math.log(numX1 / numX0) / numT1;
        const x2 = numX0 * Math.exp(k * numT2);
        const dxdt = k * x2;
    
        const steps = [
            `Step 1: Solve for c`,
            `x = ce^kt`,
            `At t = 0, x = ${numX0.toFixed(2)}, c = ${numX0.toFixed(2)}`,
            ``,
            `Step 2: Solve for k`,
            `k = ln(${numX1.toFixed(2)}/${numX0.toFixed(2)}) / ${numT1.toFixed(2)}`,
            `k = ${k.toFixed(4)}`,
            ``,
            `Step 3: Solve for x at t2`,
            `x = (${numX0.toFixed(2)})e^(${k.toFixed(4)})(${numT2.toFixed(2)})`,
            `x = ${x2.toFixed(2)} ${unitX}`,
            ``,
            `Step 4: Calculate dx/dt`,
            `dx/dt = (${k.toFixed(4)})(${x2.toFixed(2)})`,
            `dx/dt = ${dxdt.toFixed(2)} ${unitX}/${unitT}`
        ];
    
        this.solution = steps;
        this.displaySolution();
    }

    findInitialValue(inputs) {
        const { x1, t1, x2, t2, unitX } = inputs;
    
        // Convert inputs to numbers
        const numX1 = parseFloat(x1);
        const numT1 = parseFloat(t1);
        const numX2 = parseFloat(x2);
        const numT2 = parseFloat(t2);
    
        // Validate inputs
        if (isNaN(numX1) || isNaN(numT1) || isNaN(numX2) || isNaN(numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
    
        const k = Math.log(numX1 / numX2) / (numT1 - numT2);
        const c = numX1 / Math.exp(k * numT1);
    
        const steps = [
            `Step 1: Solve for k`,
            `k = ln(${numX1.toFixed(2)} / ${numX2.toFixed(2)}) / (${numT1.toFixed(2)} - ${numT2.toFixed(2)})`,
            `k = ${k.toFixed(4)}`,
            ``,
            `Step 2: Solve for Initial Value (c)`,
            `c = ${numX1.toFixed(2)} / e^(${k.toFixed(4)} * ${numT1.toFixed(2)})`,
            `c = ${c.toFixed(2)} ${unitX}`
        ];
    
        this.solution = steps;
        this.displaySolution();
    }
    
    findTime(inputs) {
        const { x0, x1, t1, x2, unitX, unitT } = inputs;
    
        // Convert inputs to numbers
        const numX0 = parseFloat(x0);
        const numX1 = parseFloat(x1);
        const numT1 = parseFloat(t1);
        const numX2 = parseFloat(x2);
    
        // Validate inputs
        if (isNaN(numX0) || isNaN(numX1) || isNaN(numT1) || isNaN(numX2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
    
        const k = Math.log(numX1 / numX0) / numT1;
        const t2 = Math.log(numX2 / numX0) / k;
    
        const steps = [
            `Step 1: Solve for k`,
            `k = ln(${numX1.toFixed(2)} / ${numX0.toFixed(2)}) / ${numT1.toFixed(2)}`,
            `k = ${k.toFixed(4)}`,
            ``,
            `Step 2: Solve for t2`,
            `t = ln(${numX2.toFixed(2)} / ${numX0.toFixed(2)}) / ${k.toFixed(4)}`,
            `t = ${t2.toFixed(2)} ${unitT}`
        ];
    
        this.solution = steps;
        this.displaySolution();
    }
}

class HeatCoolUI {
    static displayForm() {
        const selectedType = document.getElementById("heat-cool-type").value;
        const calculator = CalculatorFactory.create('heat-cool');
        const formTemplates = {
            'find-temp': { 
                fields: ['ambient-temp', 'initial-temp', 'time1', 'temp1', 'time2', 'unit-temp', 'unit-time'],
                calculateMethod: 'findTemp',
                fieldLabels: {
                    'ambient-temp': 'Ambient Temperature (Tₐ)',
                    'initial-temp': 'Initial Temperature (T₀)',
                    'time1': 'First Time Point',
                    'temp1': 'First Temperature',
                    'time2': 'Second Time Point',
                    'unit-temp': 'Temperature Unit',
                    'unit-time': 'Time Unit'
                }
            },
            'find-initial-temp': {
                fields: ['ambient-temp', 'temp1', 'time1', 'temp2', 'time2', 'unit-temp', 'unit-time'],
                calculateMethod: 'findInitialTemp',
                fieldLabels: {
                    'ambient-temp': 'Ambient Temperature (Tₐ)',
                    'temp1': 'First Temperature',
                    'time1': 'First Time Point',
                    'temp2': 'Second Temperature',
                    'time2': 'Second Time Point',
                    'unit-temp': 'Temperature Unit',
                    'unit-time': 'Time Unit'
                }
            },
            'find-time': {
                fields: ['ambient-temp', 'initial-temp', 'target-temp', 'unit-temp', 'unit-time'],
                calculateMethod: 'findTime',
                fieldLabels: {
                    'ambient-temp': 'Ambient Temperature (Tₐ)',
                    'initial-temp': 'Initial Temperature (T₀)',
                    'target-temp': 'Target Temperature',
                    'unit-temp': 'Temperature Unit',
                    'unit-time': 'Time Unit'
                }
            }
        };

        const template = formTemplates[selectedType];
        const inputForm = document.getElementById("input-form");
        
        const formHTML = `
        ${template.fields.map(field => `
            <div class="form-group">
                <label for="${field}">${template.fieldLabels[field]}</label>
                ${field === 'unit-temp' || field === 'unit-time' ? 
                    HeatCoolUI.renderUnitSelect(field) : 
                    `<input type="text" id="${field}" name="${field}" required>`
                }
            </div>
        `).join('')}
        <button type="button" id="calculate-button">Calculate</button>
    `;

        inputForm.innerHTML = formHTML;

        document.getElementById("calculate-button").onclick = () => {
            const inputs = {};
            template.fields.forEach(field => {
                inputs[HeatCoolUI.convertFieldNameToKey(field)] = document.getElementById(field).value;
            });

            const calculatorInstance = new calculator();
            calculatorInstance[template.calculateMethod](inputs);
        };
    }

    static renderUnitSelect(field) {
        const units = {
            'unit-temp': ['Celsius', 'Fahrenheit', 'Kelvin'],
            'unit-time': ['seconds', 'minutes', 'hours', 'days']
        };
        
        return `
            <select id="${field}" name="${field}">
                ${units[field].map(unit => `<option value="${unit}">${unit}</option>`).join('')}
            </select>
        `;
    }

    static convertFieldNameToKey(field) {
        const mappings = {
            'ambient-temp': 'ta',
            'initial-temp': 't0',
            'time1': 't1',
            'temp1': 't1Val',
            'time2': 't2',
            'temp2': 't2Val',  // Added this mapping
            'target-temp': 'targetTemp',
            'unit-temp': 'unitTemp',
            'unit-time': 'unitTime'
        };
        return mappings[field] || field;
    }
}

// Heat Cool Calculator
class HeatCoolCalculator extends BaseCalculator {
    findTemp(inputs) {
        const { ta, t0, t1, t1Val, t2, unitTemp, unitTime } = inputs;
    
        // Convert inputs to numbers
        const numTa = parseFloat(ta);
        const numT0 = parseFloat(t0);
        const numT1 = parseFloat(t1);
        const numT1Val = parseFloat(t1Val);
        const numT2 = parseFloat(t2);
    
        // Validate inputs
        if (isNaN(numTa) || isNaN(numT0) || isNaN(numT1) || isNaN(numT1Val) || isNaN(numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
    
        const tA = utils.toKelvin(numTa, unitTemp);
        const tInitial = utils.toKelvin(numT0, unitTemp);
        const t1Normalized = utils.normalizeTime(numT1, unitTime);
        const t2Normalized = utils.normalizeTime(numT2, unitTime);
        const t1Actual = utils.toKelvin(numT1Val, unitTemp);
    
        // Newton's Law of Cooling/Heating
        const k = Math.log((t1Actual - tA) / (tInitial - tA)) / t1Normalized;
        const tFinal = tA + (tInitial - tA) * Math.exp(k * t2Normalized);
    
        const finalTemp = utils.fromKelvin(tFinal, unitTemp);
    
        const steps = [
            `Step 1: Convert Temperatures to Kelvin`,
            `Ambient Temperature (Tₐ): ${ta}${unitTemp} = ${tA.toFixed(2)} K`,
            `Initial Temperature (T₀): ${t0}${unitTemp} = ${tInitial.toFixed(2)} K`,
            `First Temperature Point: ${t1Val}${unitTemp} = ${t1Actual.toFixed(2)} K`,
            ``,
            `Step 2: Normalize Time`,
            `First Time Point: ${t1} ${unitTime} = ${t1Normalized.toFixed(2)} hours`,
            `Second Time Point: ${t2} ${unitTime} = ${t2Normalized.toFixed(2)} hours`,
            ``,
            `Step 3: Calculate Cooling/Heating Rate (k)`,
            `k = ln((${t1Actual.toFixed(2)} - ${tA.toFixed(2)}) / (${tInitial.toFixed(2)} - ${tA.toFixed(2)})) / ${t1Normalized.toFixed(2)}`,
            `k = ${k.toFixed(4)}`,
            ``,
            `Step 4: Calculate Final Temperature`,
            `T = ${tA.toFixed(2)} + (${tInitial.toFixed(2)} - ${tA.toFixed(2)}) * e^(${k.toFixed(4)} * ${t2Normalized.toFixed(2)})`,
            `T = ${tFinal.toFixed(2)} K = ${finalTemp.toFixed(2)} ${unitTemp}`
        ];
    
        this.solution = steps;
        this.displaySolution();
    
        return finalTemp;
    }
    
    findInitialTemp(inputs) {
        const { ta, t1, t1Val, t2, t2Val, unitTemp, unitTime } = inputs;
        
        const numTa = parseFloat(ta);
        const numT1 = parseFloat(t1);
        const numT1Val = parseFloat(t1Val);
        const numT2 = parseFloat(t2);
        const numT2Val = parseFloat(t2Val);
        
        if (!utils.validateNumericInputs(numTa, numT1, numT1Val, numT2, numT2Val)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate temperature differences
        const C1 = numT1Val - numTa;
        const C2 = numT2Val - numTa;
        
        // Calculate k using the ratio of two points
        const k = -Math.log(C2 / C1) / (numT2 - numT1);
        
        // Calculate initial temperature using point 1
        const t0 = numTa + C1 * Math.exp(k * numT1);
        
        const steps = [
            `Step 1: Calculate Temperature Differences`,
            `C₁ = T₁ - T∞ = ${numT1Val.toFixed(2)} - ${numTa.toFixed(2)} = ${C1.toFixed(2)}`,
            `C₂ = T₂ - T∞ = ${numT2Val.toFixed(2)} - ${numTa.toFixed(2)} = ${C2.toFixed(2)}`,
            ``,
            `Step 2: Calculate Heat Transfer Coefficient (k)`,
            `k = -ln(${C2.toFixed(4)}/${C1.toFixed(4)})/(${numT2} - ${numT1})`,
            `k = ${k.toFixed(6)}`,
            ``,
            `Step 3: Calculate Initial Temperature`,
            `T₀ = ${numTa.toFixed(2)} + ${C1.toFixed(2)} * e^(${k.toFixed(6)} * ${numT1})`,
            `T₀ = ${t0.toFixed(2)} ${unitTemp}`
        ];
        
        this.solution = steps;
        this.displaySolution();
        
        return t0;
    }
    
    findTime(inputs) {
        const { ta, t0, targetTemp, unitTemp, unitTime } = inputs;
        
        const numTa = parseFloat(ta);
        const numT0 = parseFloat(t0);
        const numTargetTemp = parseFloat(targetTemp);
        
        if (!utils.validateNumericInputs(numTa, numT0, numTargetTemp)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
    
        const C = numT0 - numTa;
        const k = Math.log((31 - numTa) / C) / -1;
        const time = -Math.log((numTargetTemp - numTa) / C) / k;
    
        const steps = [
            `Step 1: Calculate Initial Temperature Difference (C)`,
            `C = T₀ - T∞ = ${numT0.toFixed(2)} - ${numTa.toFixed(2)} = ${C.toFixed(2)}°${unitTemp}`,
            ``,
            `Step 2: Calculate Heat Transfer Coefficient (k)`,
            `k = ln((31 - ${numTa.toFixed(2)}) / ${C.toFixed(2)}) / -1`,
            `k = ${k.toFixed(4)}`,
            ``,
            `Step 3: Calculate Time to Reach Target Temperature`,
            `t = -ln((${numTargetTemp.toFixed(2)} - ${numTa.toFixed(2)}) / ${C.toFixed(2)}) / ${k.toFixed(4)}`,
            `t = ${time.toFixed(2)} ${unitTime}`
        ];
        
        this.solution = steps;
        this.displaySolution();
        return time;
    }

}

// Initialize UI Event Listeners
UIManager.initEventListeners();
