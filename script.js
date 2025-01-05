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
        return inputs.every((input, index) => {
            if (input === null || input === undefined) {
                console.log(`Input ${index} is null or undefined:`, input);
                return false;
            }
            
            const stringValue = String(input).trim();
            if (stringValue === '') {
                console.log(`Input ${index} is empty:`, input);
                return false;
            }
            
            const numValue = parseFloat(stringValue);
            if (isNaN(numValue) || !isFinite(numValue)) {
                console.log(`Input ${index} is not a valid number:`, input);
                return false;
            }
            
            return true;
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
                    'time1': 'Time at First Point (t₁)',
                    'amount1': 'Amount at First Point (x₁)',
                    'time2': 'Target Time (t₂)',
                    'unit-x': 'Unit of Measurement',
                    'unit-time': 'Time Unit'
                },
                description: 'Calculate the amount at a specific time given initial value and an intermediate point'
            },
            'find-initial': {
                fields: ['amount1', 'time1', 'amount2', 'time2', 'unit-x', 'unit-time'],
                calculateMethod: 'findInitialValue',
                fieldLabels: {
                    'amount1': 'First Amount (x₁)',
                    'time1': 'First Time Point (t₁)',
                    'amount2': 'Second Amount (x₂)',
                    'time2': 'Second Time Point (t₂)',
                    'unit-x': 'Unit of Measurement',
                    'unit-time': 'Time Unit'
                },
                description: 'Calculate the initial value given two points on the curve'
            },
            'find-time': {
                fields: ['initial-value', 'amount1', 'time1', 'target-amount', 'unit-x', 'unit-time'],
                calculateMethod: 'findTime',
                fieldLabels: {
                    'initial-value': 'Initial Value (x₀)',
                    'amount1': 'Known Amount (x₁)',
                    'time1': 'Time at Known Point (t₁)',
                    'target-amount': 'Target Amount (x₂)',
                    'unit-x': 'Unit of Measurement',
                    'unit-time': 'Time Unit'
                },
                description: 'Calculate the time needed to reach a target amount'
            }
        };

        const template = formTemplates[selectedType];
        const inputForm = document.getElementById("input-form");
        
        const formHTML = `
            <div class="form-description">${template.description}</div>
            ${template.fields.map(field => `
                <div class="form-group">
                    <label for="${field}">${template.fieldLabels[field]}</label>
                    ${field === 'unit-x' || field === 'unit-time' ? 
                        GrowthDecayUI.renderUnitSelect(field) : 
                        `<input type="number" step="any" id="${field}" name="${field}" required 
                         placeholder="Enter ${template.fieldLabels[field].toLowerCase()}">`
                    }
                </div>
            `).join('')}
            <button type="button" id="calculate-button">Calculate</button>
        `;

        inputForm.innerHTML = formHTML;

        // Add input validation
        template.fields.forEach(field => {
            if (field !== 'unit-x' && field !== 'unit-time') {
                const input = document.getElementById(field);
                input.addEventListener('input', () => {
                    const value = parseFloat(input.value);
                    if (isNaN(value)) {
                        input.setCustomValidity('Please enter a valid number');
                    } else {
                        input.setCustomValidity('');
                    }
                });
            }
        });

        document.getElementById("calculate-button").onclick = () => {
            const inputs = {};
            let isValid = true;

            template.fields.forEach(field => {
                const element = document.getElementById(field);
                if (element.type === 'number' && !element.checkValidity()) {
                    isValid = false;
                    return;
                }
                inputs[GrowthDecayUI.convertFieldNameToKey(field)] = element.value;
            });

            if (isValid) {
                const calculatorInstance = new calculator();
                calculatorInstance[template.calculateMethod](inputs);
            } else {
                alert('Please fill in all fields with valid numbers');
            }
        };
    }

    static renderUnitSelect(field) {
        const units = {
            'unit-x': ['kg', 'g', 'mg', 'population', 'count', 'dollars', 'euros', 'units'],
            'unit-time': ['seconds', 'minutes', 'hours', 'days', 'years']
        };
        
        return `
            <select id="${field}" name="${field}" required>
                <option value="">Select ${field === 'unit-x' ? 'measurement' : 'time'} unit</option>
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
            'amount2': 'x2',
            'target-amount': 'x2',
            'unit-x': 'unitX',
            'unit-time': 'unitT'
        };
        return mappings[field] || field;
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
                    'ambient-temp': 'Ambient Temperature (T∞)',
                    'initial-temp': 'Initial Temperature (T₀)',
                    'time1': 'Time at Known Point (t₁)',
                    'temp1': 'Temperature at Known Point (T₁)',
                    'time2': 'Target Time (t₂)',
                    'unit-temp': 'Temperature Unit',
                    'unit-time': 'Time Unit'
                },
                description: 'Calculate temperature at a specific time given initial and ambient temperatures'
            },
            'find-initial-temp': {
                fields: ['ambient-temp', 'temp1', 'time1', 'temp2', 'time2', 'unit-temp', 'unit-time'],
                calculateMethod: 'findInitialTemp',
                fieldLabels: {
                    'ambient-temp': 'Ambient Temperature (T∞)',
                    'temp1': 'First Temperature (T₁)',
                    'time1': 'First Time Point (t₁)',
                    'temp2': 'Second Temperature (T₂)',
                    'time2': 'Second Time Point (t₂)',
                    'unit-temp': 'Temperature Unit',
                    'unit-time': 'Time Unit'
                },
                description: 'Calculate initial temperature given ambient temperature and two points'
            },
            'find-time': {
                fields: ['ambient-temp', 'initial-temp', 'known-temp1', 'known-time1', 'target-temp', 'unit-temp', 'unit-time'],
                calculateMethod: 'findTime',
                fieldLabels: {
                    'ambient-temp': 'Ambient Temperature (T∞)',
                    'initial-temp': 'Initial Temperature (T₀)',
                    'known-temp1': 'Known Temperature (T₁)',
                    'known-time1': 'Time at Known Point (t₁)',
                    'target-temp': 'Target Temperature (T₂)',
                    'unit-temp': 'Temperature Unit',
                    'unit-time': 'Time Unit'
                },
                description: 'Calculate time needed to reach a target temperature'
            }
        };

        const template = formTemplates[selectedType];
        const inputForm = document.getElementById("input-form");
        
        const formHTML = `
            <div class="form-description">${template.description}</div>
            ${template.fields.map(field => `
                <div class="form-group">
                    <label for="${field}">${template.fieldLabels[field]}</label>
                    ${field === 'unit-temp' || field === 'unit-time' ? 
                        HeatCoolUI.renderUnitSelect(field) : 
                        `<input type="number" step="any" id="${field}" name="${field}" required 
                         placeholder="Enter ${template.fieldLabels[field].toLowerCase()}">`
                    }
                </div>
            `).join('')}
            <button type="button" id="calculate-button">Calculate</button>
        `;

        inputForm.innerHTML = formHTML;

        // Add input validation
        template.fields.forEach(field => {
            if (field !== 'unit-temp' && field !== 'unit-time') {
                const input = document.getElementById(field);
                input.addEventListener('input', () => {
                    const value = parseFloat(input.value);
                    if (isNaN(value)) {
                        input.setCustomValidity('Please enter a valid number');
                    } else {
                        input.setCustomValidity('');
                    }
                });
            }
        });

        document.getElementById("calculate-button").onclick = () => {
            const inputs = {};
            let isValid = true;

            template.fields.forEach(field => {
                const element = document.getElementById(field);
                if (element.type === 'number' && !element.checkValidity()) {
                    isValid = false;
                    return;
                }
                inputs[HeatCoolUI.convertFieldNameToKey(field)] = element.value;
            });

            if (isValid) {
                const calculatorInstance = new calculator();
                calculatorInstance[template.calculateMethod](inputs);
            } else {
                alert('Please fill in all fields with valid numbers');
            }
        };
    }

    static renderUnitSelect(field) {
        const units = {
            'unit-temp': ['Celsius', 'Fahrenheit', 'Kelvin'],
            'unit-time': ['seconds', 'minutes', 'hours', 'days', 'weeks']
        };
        
        return `
            <select id="${field}" name="${field}" required>
                <option value="">Select ${field === 'unit-temp' ? 'temperature' : 'time'} unit</option>
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
            'temp2': 't2Val',
            'target-temp': 'targetTemp',
            'known-temp1': 'knownTemp1',
            'known-time1': 'knownTime1',
            'unit-temp': 'unitTemp',
            'unit-time': 'unitTime'
        };
        return mappings[field] || field;
    }
}

// Growth/Decay Calculator 
class GrowthDecayCalculator extends BaseCalculator {
    findAmount(inputs) {
        const { x0, t1, x1, t2, unitX, unitT } = inputs;
        
        // Convert inputs to numbers and validate
        const numX0 = parseFloat(x0);
        const numT1 = parseFloat(t1);
        const numX1 = parseFloat(x1);
        const numT2 = parseFloat(t2);
        
        if (isNaN(numX0) || isNaN(numT1) || isNaN(numX1) || isNaN(numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate growth/decay rate (k)
        const k = Math.log(numX1 / numX0) / numT1;
        
        // Calculate final amount
        const result = numX0 * Math.exp(k * numT2);
        
        // Calculate rate of change
        const dxdt = k * result;
        
        const steps = [
            `Growth/Decay Calculation - Amount at t₂`,
            `----------------------------------------`,
            `Given:`,
            `• Initial value (x₀) = ${numX0} ${unitX}`,
            `• Value at t₁ (x₁) = ${numX1} ${unitX}`,
            `• Time 1 (t₁) = ${numT1} ${unitT}`,
            `• Time 2 (t₂) = ${numT2} ${unitT}`,
            ``,
            `Step 1: Calculate growth/decay rate (k)`,
            `k = ln(x₁/x₀)/t₁`,
            `k = ln(${numX1}/${numX0})/${numT1}`,
            `k = ${k.toFixed(6)} per ${unitT}`,
            ``,
            `Step 2: Calculate amount at t₂`,
            `x(t) = x₀ * e^(k*t)`,
            `x(${numT2}) = ${numX0} * e^(${k.toFixed(6)} * ${numT2})`,
            `x(${numT2}) = ${result.toFixed(4)} ${unitX}`,
            ``,
            `Step 3: Calculate rate of change (dx/dt)`,
            `dx/dt = k * x(t)`,
            `dx/dt = ${k.toFixed(6)} * ${result.toFixed(4)}`,
            `dx/dt = ${dxdt.toFixed(4)} ${unitX}/${unitT}`,
            ``,
            `The ${result > numX0 ? 'growth' : 'decay'} model is:`,
            `x(t) = ${numX0} * e^(${k.toFixed(6)}t) ${unitX}`
        ];
        
        this.solution = steps;
        this.displaySolution();
    }

    findInitialValue(inputs) {
        const { x1, t1, x2, t2, unitX, unitT } = inputs;
        
        // Convert inputs to numbers
        const numX1 = parseFloat(x1);
        const numT1 = parseFloat(t1);
        const numX2 = parseFloat(x2);
        const numT2 = parseFloat(t2);
        
        if (isNaN(numX1) || isNaN(numT1) || isNaN(numX2) || isNaN(numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate growth/decay rate using two points
        const k = Math.log(numX2 / numX1) / (numT2 - numT1);
        
        // Calculate initial value
        const x0 = numX1 * Math.exp(-k * numT1);
        
        const steps = [
            `Growth/Decay Calculation - Initial Value`,
            `----------------------------------------`,
            `Given:`,
            `• Value at t₁ (x₁) = ${numX1} ${unitX}`,
            `• Value at t₂ (x₂) = ${numX2} ${unitX}`,
            `• Time 1 (t₁) = ${numT1} ${unitT}`,
            `• Time 2 (t₂) = ${numT2} ${unitT}`,
            ``,
            `Step 1: Calculate growth/decay rate (k)`,
            `k = ln(x₂/x₁)/(t₂-t₁)`,
            `k = ln(${numX2}/${numX1})/(${numT2}-${numT1})`,
            `k = ${k.toFixed(6)} per ${unitT}`,
            ``,
            `Step 2: Calculate initial value (x₀)`,
            `x₀ = x₁ * e^(-k*t₁)`,
            `x₀ = ${numX1} * e^(${(-k).toFixed(6)} * ${numT1})`,
            `x₀ = ${x0.toFixed(4)} ${unitX}`,
            ``,
            `The ${k > 0 ? 'growth' : 'decay'} model is:`,
            `x(t) = ${x0.toFixed(4)} * e^(${k.toFixed(6)}t) ${unitX}`
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
        
        if (isNaN(numX0) || isNaN(numX1) || isNaN(numT1) || isNaN(numX2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate growth/decay rate using initial point and point at t₁
        const k = Math.log(numX1 / numX0) / numT1;
        
        // Calculate time to reach target value
        const t2 = Math.log(numX2 / numX0) / k;
        
        const steps = [
            `Growth/Decay Calculation - Time to Reach Target`,
            `----------------------------------------------`,
            `Given:`,
            `• Initial value (x₀) = ${numX0} ${unitX}`,
            `• Value at t₁ (x₁) = ${numX1} ${unitX}`,
            `• Time 1 (t₁) = ${numT1} ${unitT}`,
            `• Target value (x₂) = ${numX2} ${unitX}`,
            ``,
            `Step 1: Calculate growth/decay rate (k)`,
            `k = ln(x₁/x₀)/t₁`,
            `k = ln(${numX1}/${numX0})/${numT1}`,
            `k = ${k.toFixed(6)} per ${unitT}`,
            ``,
            `Step 2: Calculate time to reach target (t₂)`,
            `t₂ = ln(x₂/x₀)/k`,
            `t₂ = ln(${numX2}/${numX0})/${k.toFixed(6)}`,
            `t₂ = ${t2.toFixed(4)} ${unitT}`,
            ``,
            `The ${k > 0 ? 'growth' : 'decay'} model is:`,
            `x(t) = ${numX0} * e^(${k.toFixed(6)}t) ${unitX}`
        ];
        
        this.solution = steps;
        this.displaySolution();
    }
}

// Heat/Cool Calculator 
class HeatCoolCalculator extends BaseCalculator {
    findTemp(inputs) {
        const { ta, t0, t1, t1Val, t2, unitTemp, unitTime } = inputs;
        
        // Convert inputs to numbers and validate
        const numTa = parseFloat(ta);
        const numT0 = parseFloat(t0);
        const numT1 = parseFloat(t1);
        const numT1Val = parseFloat(t1Val);
        const numT2 = parseFloat(t2);
        
        if (!this.validateInputs(numTa, numT0, numT1, numT1Val, numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate temperature difference
        const C = numT0 - numTa;
        
        // Calculate k using the known point
        const k = Math.log((numT1Val - numTa) / C) / -numT1;
        
        // Calculate final temperature
        const finalTemp = numTa + C * Math.exp(-k * numT2);
        
        const steps = [
            `Detailed Heat Transfer Calculation:`,
            `--------------------`,
            `Step 1: Initial Conditions`,
            `@t=0 ${unitTime}, T=${numT0.toFixed(2)}°${unitTemp}, T∞=${numTa.toFixed(2)}°${unitTemp}`,
            `Known point: @t=${numT1} ${unitTime}, T=${numT1Val}°${unitTemp}`,
            `T-T∞=Ce^(-kt)`,
            ``,
            `Step 2: Calculate Initial Temperature Difference (C)`,
            `C = T₀ - T∞`,
            `C = ${numT0.toFixed(2)} - ${numTa.toFixed(2)}`,
            `C = ${C.toFixed(2)}°${unitTemp}`,
            ``,
            `Step 3: Calculate k using known point`,
            `${numT1Val} = ${numTa.toFixed(2)} + ${C.toFixed(2)}e^(-k*${numT1})`,
            `${(numT1Val - numTa).toFixed(2)} = ${C.toFixed(2)}e^(-k*${numT1})`,
            `k = ${k.toFixed(6)} per ${unitTime}`,
            ``,
            `Step 4: Calculate Temperature at Target Time`,
            `T = T∞ + Ce^(-kt)`,
            `T = ${numTa.toFixed(2)} + ${C.toFixed(2)}e^(-${k.toFixed(6)}*${numT2})`,
            `T = ${finalTemp.toFixed(2)}°${unitTemp}`,
            ``,
            `Verification:`,
            `- Ambient Temperature (T∞): ${numTa.toFixed(2)}°${unitTemp}`,
            `- Initial Temperature (T₀): ${numT0.toFixed(2)}°${unitTemp}`,
            `- Known Point: ${numT1Val.toFixed(2)}°${unitTemp} at t=${numT1} ${unitTime}`,
            `- Temperature at t=${numT2} ${unitTime}: ${finalTemp.toFixed(2)}°${unitTemp}`,
            `- Cooling Coefficient (k): ${k.toFixed(6)} per ${unitTime}`
        ];
        
        this.solution = steps;
        this.displaySolution();
    }

    validateInputs(...values) {
        return values.every(value => !isNaN(value) && value !== null && value !== undefined);
    }

    findInitialTemp(inputs) {
        const { ta, t1Val, t1, t2Val, t2, unitTemp, unitTime } = inputs;
        
        // Convert inputs to numbers
        const numTa = parseFloat(ta);
        const numT1Val = parseFloat(t1Val);
        const numT1 = parseFloat(t1);
        const numT2Val = parseFloat(t2Val);
        const numT2 = parseFloat(t2);
        
        if (!this.validateInputs(numTa, numT1Val, numT1, numT2Val, numT2)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate temperature differences
        const C1 = numT1Val - numTa;
        const C2 = numT2Val - numTa;
        
        // Calculate k using two points
        const k = -Math.log(C2 / C1) / (numT2 - numT1);
        
        // Calculate initial temperature
        const initialTemp = numTa + C1 * Math.exp(k * numT1);
        
        const steps = [
            `Detailed Heat Transfer Calculation:`,
            `--------------------`,
            `Step 1: Calculate Temperature Differences`,
            `C₁ = T₁ - T∞ = ${numT1Val.toFixed(2)} - ${numTa.toFixed(2)} = ${C1.toFixed(2)}`,
            `C₂ = T₂ - T∞ = ${numT2Val.toFixed(2)} - ${numTa.toFixed(2)} = ${C2.toFixed(2)}`,
            ``,
            `Step 2: Calculate Heat Transfer Coefficient (k)`,
            `Using the ratio of two known points:`,
            `T₁ - T∞ = C₁e^(-k*t₁)`,
            `T₂ - T∞ = C₁e^(-k*t₂)`,
            `(T₂ - T∞)/(T₁ - T∞) = e^(-k(t₂-t₁))`,
            `k = -ln((T₂ - T∞)/(T₁ - T∞))/(t₂-t₁)`,
            `k = -ln(${C2.toFixed(4)}/${C1.toFixed(4)})/(${numT2} - ${numT1})`,
            `k = ${k.toFixed(6)} per ${unitTime}`,
            ``,
            `Step 3: Calculate Initial Temperature`,
            `T₀ = T∞ + (T₁ - T∞)e^(kt₁)`,
            `T₀ = ${numTa.toFixed(2)} + ${C1.toFixed(2)} * e^(${k.toFixed(6)} * ${numT1})`,
            `T₀ = ${initialTemp.toFixed(2)}°${unitTemp}`,
            ``,
            `Verification:`,
            `- Ambient Temperature (T∞): ${numTa.toFixed(2)}°${unitTemp}`,
            `- Known Point 1: ${numT1Val.toFixed(2)}°${unitTemp} at t=${numT1} ${unitTime}`,
            `- Known Point 2: ${numT2Val.toFixed(2)}°${unitTemp} at t=${numT2} ${unitTime}`,
            `- Heat Transfer Coefficient (k): ${k.toFixed(6)} per ${unitTime}`,
            `- Initial Temperature (T₀): ${initialTemp.toFixed(2)}°${unitTemp}`
        ];
        
        this.solution = steps;
        this.displaySolution();
    }

    findTime(inputs) {
        const { ta, t0, knownTemp1, knownTime1, targetTemp, unitTemp, unitTime } = inputs;
        
        // Convert inputs to numbers
        const numTa = parseFloat(ta);
        const numT0 = parseFloat(t0);
        const numKnownTemp1 = parseFloat(knownTemp1);
        const numKnownTime1 = parseFloat(knownTime1);
        const numTargetTemp = parseFloat(targetTemp);
        
        if (!this.validateInputs(numTa, numT0, numKnownTemp1, numKnownTime1, numTargetTemp)) {
            alert("Please enter valid numeric values for all inputs.");
            return;
        }
        
        // Calculate temperature difference C
        const C = numT0 - numTa;
        
        // Calculate k using the known point
        const k = Math.log((numKnownTemp1 - numTa) / C) / -numKnownTime1;
        
        // Calculate time to reach target temperature
        const time = -Math.log((numTargetTemp - numTa) / C) / k;
        
        const steps = [
            `Detailed Heat Transfer Calculation:`,
            `--------------------`,
            `Step 1: Initial Conditions`,
            `@t=0 ${unitTime}, T=${numT0.toFixed(2)}°${unitTemp}, T∞=${numTa.toFixed(2)}°${unitTemp}`,
            `Known point: @t=${numKnownTime1} ${unitTime}, T=${numKnownTemp1}°${unitTemp}`,
            `T-T∞=Ce^(-kt)`,
            ``,
            `Step 2: Calculate Initial Temperature Difference (C)`,
            `C = T₀ - T∞`,
            `C = ${numT0.toFixed(2)} - ${numTa.toFixed(2)}`,
            `C = ${C.toFixed(2)}°${unitTemp}`,
            ``,
            `Step 3: Calculate k using known point`,
            `${numKnownTemp1} = ${numTa.toFixed(2)} + ${C.toFixed(2)}e^(-k*${numKnownTime1})`,
            `${(numKnownTemp1 - numTa).toFixed(2)} = ${C.toFixed(2)}e^(-k*${numKnownTime1})`,
            `k = ${k.toFixed(6)} per ${unitTime}`,
            ``,
            `Step 4: Calculate Time to Reach Target Temperature`,
            `T = T∞ + Ce^(-kt)`,
            `${numTargetTemp.toFixed(2)} = ${numTa.toFixed(2)} + ${C.toFixed(2)}e^(-${k.toFixed(6)}t)`,
            `${(numTargetTemp - numTa).toFixed(2)} = ${C.toFixed(2)}e^(-${k.toFixed(6)}t)`,
            `t = -ln((${numTargetTemp.toFixed(2)} - ${numTa.toFixed(2)})/${C.toFixed(2)})/${k.toFixed(6)}`,
            `t = ${time.toFixed(2)} ${unitTime}`,
            ``,
            `Time in minutes and seconds: ${Math.floor(time)} min and ${Math.round((time % 1) * 60)} seconds`,
            ``,
            `Verification:`,
            `- Ambient Temperature (T∞): ${numTa.toFixed(2)}°${unitTemp}`,
            `- Initial Temperature (T₀): ${numT0.toFixed(2)}°${unitTemp}`,
            `- Known Point: ${numKnownTemp1.toFixed(2)}°${unitTemp} at t=${numKnownTime1} ${unitTime}`,
            `- Target Temperature: ${numTargetTemp.toFixed(2)}°${unitTemp}`,
            `- Cooling Coefficient (k): ${k.toFixed(6)} per ${unitTime}`,
            `- Required Time: ${time.toFixed(2)} ${unitTime}`
        ];
        
        this.solution = steps;
        this.displaySolution();
    }
}

// Initialize UI Event Listeners
UIManager.initEventListeners();
