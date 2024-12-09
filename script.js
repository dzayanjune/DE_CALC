document.getElementById("proceed-button").addEventListener("click", function () {
    document.getElementById("welcome-section").classList.add("hidden");
    document.getElementById("options-section").classList.remove("hidden");
});

document.getElementById("start-button").addEventListener("click", startCalculator);

function appendUserChoices(choices, solution) {
    solution.push("\n### User Choices ###");
    Object.entries(choices).forEach(([key, value]) => {
        solution.push(`${key}: ${value}`);
    });
    solution.push("\n");
}

function validateInput(inputId, errorMessage) {
    const input = document.getElementById(inputId);
    if (isNaN(parseFloat(input.value)) || input.value.trim() === "") {
        alert(errorMessage);
        input.focus();
        return false;
    }
    return true;
}

function toKelvin(value, unit) {
    switch (unit) {
        case "Celsius":
            return value + 273.15;
        case "Fahrenheit":
            return (value - 32) * (5 / 9) + 273.15;
        case "Kelvin":
        default:
            return value;
    }
}

function fromKelvin(value, unit) {
    switch (unit) {
        case "Celsius":
            return value - 273.15;
        case "Fahrenheit":
            return (value - 273.15) * (9 / 5) + 32;
        case "Kelvin":
        default:
            return value;
    }
}

function denormalizeTime(value, unit) {
    switch (unit) {
        case "seconds":
            return value * 3600; // Convert hours to seconds
        case "minutes":
            return value * 60; // Convert hours to minutes
        case "days": return value / 24;
        case "year": return value / (24 * 365.25)
        case "hours":
        default:
            return value; // Already in hours
    }
}

function normalizeTime(value, unit) {
    switch (unit) {
        case "seconds":
            return value / 3600; // Convert seconds to hours
        case "minutes":
            return value / 60; // Convert minutes to hours
        case "days": return value * 24;
        case "year": return value * 24 * 365.25
        case "hours":
        default:
            return value; // Already in hours
    }
}

function startCalculator() {
    const calcType = document.getElementById("calc-type").value;
    const inputSection = document.getElementById("input-section");
    const inputForm = document.getElementById("input-form");

    inputForm.innerHTML = ""; // Clear previous inputs

    if (calcType === "growth-decay") {
        inputForm.innerHTML = `
            <label>Select the Calculation Type:
                <select id="growth-decay-type">
                    <option value="find-amount">Determine the amount of Growth or Decay at a given Time (t).</option>
                    <option value="find-initial">Determine the Initial Value (x₀).</option>
                    <option value="find-time">Determine the Time (t) for a given amount of x.</option>
                </select>
            </label>
            <button type="button" id="select-type-button">Next</button>
        `;
        document.getElementById("select-type-button").onclick = displayGrowthDecayForm;
    } else if (calcType === "heat-cool") {
        inputForm.innerHTML = `
            <label>Select the Calculation Type:
                <select id="heat-cool-type">
                    <option value="find-temp">Determine Temperature at Time</option>
                    <option value="find-initial-temp">Determine Initial Temperature</option>
                    <option value="find-time">Determine Time to Reach Temperature</option>
                </select>
            </label>
            <button type="button" id="select-type-button">Next</button>
        `;
        document.getElementById("select-type-button").onclick = displayHeatCoolForm;
    }

    inputSection.classList.remove("hidden");
}

function displayGrowthDecayForm() {
    const selectedType = document.getElementById("growth-decay-type").value;
    const inputForm = document.getElementById("input-form");

    inputForm.innerHTML = ""; // Clear inputs

    if (selectedType === "find-amount") {
        inputForm.innerHTML = `
            <label for="initial-value">Initial Value (x₀):</label>
            <input type="text" id="initial-value" required>
            
            <label for="time1">Time t₁:</label>
            <input type="text" id="time1" required>
            
            <label for="amount1">Amount at Time t₁ (x₁):</label>
            <input type="text" id="amount1" required>
            
            <label for="time2">Time t₂:</label>
            <input type="text" id="time2" required>
            
            <label for="unit-x">Unit of x:</label>
            <input type="text" id="unit-x" required>
            
            <label for="unit-time">Unit of Time:</label>
            <input type="text" id="unit-time" required>
            
            <button type="button" id="calculate-button">Calculate</button>
        `;
        document.getElementById("calculate-button").onclick = calculateGrowthDecay;
    } else if (selectedType === "find-initial") {
        inputForm.innerHTML = `
            <label for="amount1">Amount at Time t₁ (x₁):</label>
            <input type="text" id="amount1" required>
            
            <label for="time1">Time t₁:</label>
            <input type="text" id="time1" required>
            
            <label for="amount2">Amount at Time t₂ (x₂):</label>
            <input type="text" id="amount2" required>
            
            <label for="time2">Time t₂:</label>
            <input type="text" id="time2" required>
            
            <label for="unit-x">Unit of x:</label>
            <input type="text" id="unit-x" required>
            
            <button type="button" id="calculate-button">Calculate</button>
        `;
        document.getElementById("calculate-button").onclick = calculateInitialValue;
    } else if (selectedType === "find-time") {
        inputForm.innerHTML = `
            <label for="initial-value">Initial Value (x₀):</label>
            <input type="text" id="initial-value" required>
            
            <label for="amount1">Amount at Time t₁ (x₁):</label>
            <input type="text" id="amount1" required>
            
            <label for="time1">Time t₁:</label>
            <input type="text" id="time1" required>
            
            <label for="amount2">Amount at Time t₂ (x₂):</label>
            <input type="text" id="amount2" required>
            
            <label for="unit-x">Unit of x:</label>
            <input type="text" id="unit-x" required>
            
            <label for="unit-time">Unit of Time:</label>
            <input type="text" id="unit-time" required>
            
            <button type="button" id="calculate-button">Calculate</button>
        `;
        document.getElementById("calculate-button").onclick = calculateTime;
    }
}

function calculateInitialValue() {
    const x1 = parseFloat(document.getElementById("amount1").value);
    const t1 = parseFloat(document.getElementById("time1").value);
    const x2 = parseFloat(document.getElementById("amount2").value);
    const t2 = parseFloat(document.getElementById("time2").value);
    const unitX = document.getElementById("unit-x").value;

    if (isNaN(x1) || isNaN(t1) || isNaN(x2) || isNaN(t2)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    // Calculate k
    const k = Math.log(x1 / x2) / (t1 - t2);

    // Calculate c (initial value)
    const c = x1 / Math.exp(k * t1);

    let solution = [
        `Step 1: Solve for k`,
        `x = ce^kt`,
        `@ t = ${t1.toFixed(2)}, x = ${x1.toFixed(2)}, k = ?`,
        `k = ln(${x1.toFixed(2)} / ${x2.toFixed(2)}) / (${t1.toFixed(2)} - ${t2.toFixed(2)})`,
        `k = ${k.toFixed(4)}`,
        ``,
        `Step 2: Solve for Initial Value (c)`,
        `x = ce^kt`,
        `${x1.toFixed(2)} = c * e^(${k.toFixed(4)} * ${t1.toFixed(2)})`,
        `c = ${x1.toFixed(2)} / e^(${k.toFixed(4)} * ${t1.toFixed(2)})`,
        `c = ${c.toFixed(2)} ${unitX}`,
        ``,
        `The Initial Value is ${c.toFixed(2)} ${unitX}`
    ];

    displaySolution(solution.join('\n'));
}

function calculateTime() {
    const x0 = parseFloat(document.getElementById("initial-value").value);
    const x1 = parseFloat(document.getElementById("amount1").value);
    const t1 = parseFloat(document.getElementById("time1").value);
    const x2 = parseFloat(document.getElementById("amount2").value);
    const unitX = document.getElementById("unit-x").value;
    const unitT = document.getElementById("unit-time").value;

    if (isNaN(x0) || isNaN(x1) || isNaN(t1) || isNaN(x2)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    // Calculate k
    const k = Math.log(x1 / x0) / t1;

    // Calculate t2
    const t2 = Math.log(x2 / x0) / k;

    let solution = [
        `Step 1: Solve for k`,
        `x = ce^kt`,
        `@ t = ${t1.toFixed(2)}, x = ${x1.toFixed(2)}, c = ${x0.toFixed(2)}, k = ?`,
        `k = ln(${x1.toFixed(2)} / ${x0.toFixed(2)}) / ${t1.toFixed(2)}`,
        `k = ${k.toFixed(4)}`,
        ``,
        `Step 2: Solve for t2`,
        `x = ${x0.toFixed(2)} * e^(${k.toFixed(4)} * t)`,
        `${x2.toFixed(2)} = ${x0.toFixed(2)} * e^(${k.toFixed(4)} * t)`,
        `t = ln(${x2.toFixed(2)} / ${x0.toFixed(2)}) / ${k.toFixed(4)}`,
        `t = ${t2.toFixed(2)} ${unitT}`,
        ``,
        `The Time required to reach ${x2.toFixed(2)} ${unitX} is ${t2.toFixed(2)} ${unitT}`
    ];

    displaySolution(solution.join('\n'));
}

function calculateGrowthDecay() {
    const x0 = parseFloat(document.getElementById("initial-value").value);
    const t1 = parseFloat(document.getElementById("time1").value);
    const x1 = parseFloat(document.getElementById("amount1").value);
    const t2 = parseFloat(document.getElementById("time2").value);
    const unitX = document.getElementById("unit-x").value;
    const unitT = document.getElementById("unit-time").value;

    if (isNaN(x0) || isNaN(t1) || isNaN(x1) || isNaN(t2)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    // Calculate k
    const k = Math.log(x1 / x0) / t1;

    // Calculate x2
    const x2 = x0 * Math.exp(k * t2);

    // Calculate dx/dt
    const dxdt = k * x2;

    let solution = [
        `Step 1: Solve for c`,
        `x = ce^kt`,
        `At t = 0, x = ${x0.toFixed(2)}, c = ?`,
        `${x0.toFixed(2)} = ce^k(0)`,
        `c = ${x0.toFixed(2)}`,
        ``,
        `Step 2: Solve for k`,
        `@ t = ${t1.toFixed(2)}, x = ${x1.toFixed(2)}, c = ${x0.toFixed(2)}, k = ?`,
        `${x1.toFixed(2)} = (${x0.toFixed(2)})e^k(${t1.toFixed(2)})`,
        `${x1.toFixed(2)}/${x0.toFixed(2)} = e^k(${t1.toFixed(2)})`,
        `ln(${x1.toFixed(2)}/${x0.toFixed(2)}) = ln(e^k(${t1.toFixed(2)}))`,
        `ln(${x1.toFixed(2)}/${x0.toFixed(2)}) = k(${t1.toFixed(2)})`,
        `k = ${k.toFixed(4)}`,
        ``,
        `Step 3: Solve for x at t2`,
        `@ t = ${t2.toFixed(2)}, x = ?, c = ${x0.toFixed(2)}, k = ${k.toFixed(4)}`,
        `x = ce^kt`,
        `x = (${x0.toFixed(2)})e^(${k.toFixed(4)})(${t2.toFixed(2)})`,
        `x = ${x2.toFixed(2)}`,
        ``,
        `Step 4: Calculate dx/dt`,
        `dx/dt = kx`,
        `dx/dt = (${k.toFixed(4)})(${x2.toFixed(2)})`,
        `dx/dt = ${dxdt.toFixed(2)} ${unitX}/${unitT}`,
        ``,
        `THE GROWTH/DECAY RATE OF x IS ${dxdt.toFixed(2)} ${unitX}/${unitT}`,
        `AT TIME ${t2.toFixed(2)} ${unitT} THE "x" IS ${x2.toFixed(2)} ${unitX}`
    ];

    displaySolution(solution.join('\n'));
}

function displayHeatCoolForm() {
    const selectedType = document.getElementById("heat-cool-type").value;
    const inputForm = document.getElementById("input-form");

    inputForm.innerHTML = ""; // Clear inputs

    const temperatureUnitDropdown = `
        <label for="unit-temp">Unit of Temperature:</label>
        <select id="unit-temp" required>
            <option value="Celsius">Celsius (°C)</option>
            <option value="Fahrenheit">Fahrenheit (°F)</option>
            <option value="Kelvin" selected>Kelvin (K)</option>
        </select>
    `;

    const timeUnitDropdown = `
        <label for="unit-time">Unit of Time:</label>
        <select id="unit-time" required>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours" selected>Hours</option>
        </select>
    `;

    if (selectedType === "find-temp") {
        inputForm.innerHTML = `
            <label for="ambient-temp">Ambient Temperature (Tₐ):</label>
            <input type="text" id="ambient-temp" required>
            <label for="initial-temp">Initial Temperature (T₀):</label>
            <input type="text" id="initial-temp" required>
            <label for="known-time">Known Time (t₁):</label>
            <input type="text" id="known-time" required>
            <label for="known-temp">Temperature at t₁ (T₁):</label>
            <input type="text" id="known-temp" required>
            <label for="target-time">Target Time (t₂):</label>
            <input type="text" id="target-time" required>
            ${temperatureUnitDropdown}
            ${timeUnitDropdown}
            <button type="button" id="calculate-button">Calculate</button>
        `;
        document.getElementById("calculate-button").onclick = calculateHeatCoolTemp;
    } else if (selectedType === "find-initial-temp") {
        inputForm.innerHTML = `
            <label for="ambient-temp">Ambient Temperature (Tₐ):</label>
            <input type="text" id="ambient-temp" required>
            <label for="known-time1">Time t₁:</label>
            <input type="text" id="known-time1" required>
            <label for="known-temp1">Temperature at Time t₁ (T₁):</label>
            <input type="text" id="known-temp1" required>
            <label for="known-time2">Time t₂:</label>
            <input type="text" id="known-time2" required>
            <label for="known-temp2">Temperature at Time t₂ (T₂):</label>
            <input type="text" id="known-temp2" required>
            ${temperatureUnitDropdown}
            ${timeUnitDropdown}
            <button type="button" id="calculate-button">Calculate</button>
        `;
        document.getElementById("calculate-button").onclick = calculateHeatCoolInitialTemp;
    } else if (selectedType === "find-time") {
        inputForm.innerHTML = `
            <label for="ambient-temp">Ambient Temperature (Tₐ):</label>
            <input type="text" id="ambient-temp" required>
            <label for="initial-temp">Initial Temperature (T₀):</label>
            <input type="text" id="initial-temp" required>
            <label for="target-temp">Target Temperature (T):</label>
            <input type="text" id="target-temp" required>
            ${temperatureUnitDropdown}
            ${timeUnitDropdown}
            <button type="button" id="calculate-button">Calculate</button>
        `;
        document.getElementById("calculate-button").onclick = calculateHeatCoolTime;
    }
}


function calculateHeatCoolTemp() {
    const T_a = parseFloat(document.getElementById("ambient-temp").value);
    const T_0 = parseFloat(document.getElementById("initial-temp").value);
    const t1 = parseFloat(document.getElementById("known-time").value);
    const T1 = parseFloat(document.getElementById("known-temp").value);
    const t2 = parseFloat(document.getElementById("target-time").value);
    const unitTemp = document.getElementById("unit-temp").value;
    const unitTime = document.getElementById("unit-time").value;

    if (isNaN(T_a) || isNaN(T_0) || isNaN(t1) || isNaN(T1) || isNaN(t2)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    const T_aK = toKelvin(T_a, unitTemp);
    const T_0K = toKelvin(T_0, unitTemp);
    const T1K = toKelvin(T1, unitTemp);

    const t1InHours = normalizeTime(t1, unitTime);
    const t2InHours = normalizeTime(t2, unitTime);

    const k = -Math.log((T1K - T_aK) / (T_0K - T_aK)) / t1InHours;
    const T2K = T_aK + (T_0K - T_aK) * Math.exp(-k * t2InHours);
    const T2 = fromKelvin(T2K, unitTemp);

    const t2OriginalUnit = denormalizeTime(t2InHours, unitTime);

    let solution = [
        `Step 1: Solve for k`,
        `k = -ln((${T1K.toFixed(2)} - ${T_aK.toFixed(2)}) / (${T_0K.toFixed(2)} - ${T_aK.toFixed(2)})) / ${t1InHours.toFixed(2)} hours`,
        `k = ${k.toFixed(4)}`,
        ``,
        `Step 2: Solve for T at t₂`,
        `T = Tₐ + (T₀ - Tₐ)e^(-kt)`,
        `T = ${T_aK.toFixed(2)} + (${T_0K.toFixed(2)} - ${T_aK.toFixed(2)})e^(-${k.toFixed(4)} × ${t2InHours.toFixed(2)})`,
        `T = ${T2.toFixed(2)}°${unitTemp}`,
        ``,
        `At time ${t2OriginalUnit.toFixed(2)} ${unitTime}, the temperature is ${T2.toFixed(2)}°${unitTemp}`
    ];

    displaySolution(solution.join("\n"));
}


function calculateHeatCoolTime() {
    const T_a = parseFloat(document.getElementById("ambient-temp").value);
    const T_0 = parseFloat(document.getElementById("initial-temp").value);
    const T = parseFloat(document.getElementById("target-temp").value);
    const unitTemp = document.getElementById("unit-temp").value;
    const unitTime = document.getElementById("unit-time").value;

    if (isNaN(T_a) || isNaN(T_0) || isNaN(T)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    // Convert temperatures to Kelvin
    const T_aK = toKelvin(T_a, unitTemp);
    const T_0K = toKelvin(T_0, unitTemp);
    const TK = toKelvin(T, unitTemp);

    // Calculate k
    const k = -Math.log((T_0K - T_aK) / (TK - T_aK));

    // Calculate time (in hours)
    const timeInHours = -Math.log((TK - T_aK) / (T_0K - T_aK)) / k;

    // Convert time back to the selected unit
    const timeInOriginalUnit = denormalizeTime(timeInHours, unitTime);

    let solution = [
        `Step 1: Solve for k`,
        `Using the formula: T = Tₐ + (T₀ - Tₐ)e^(-kt)`,
        `k = -ln((${T_0K.toFixed(2)} - ${T_aK.toFixed(2)}) / (${TK.toFixed(2)} - ${T_aK.toFixed(2)}))`,
        `k = ${k.toFixed(4)}`,
        ``,
        `Step 2: Solve for t`,
        `Using the formula: t = -ln((T - Tₐ) / (T₀ - Tₐ)) / k`,
        `t = -ln((${TK.toFixed(2)} - ${T_aK.toFixed(2)}) / (${T_0K.toFixed(2)} - ${T_aK.toFixed(2)})) / ${k.toFixed(4)}`,
        `t = ${timeInHours.toFixed(2)} hours`,
        ``,
        `Converted to the selected time unit:`,
        `t = ${timeInOriginalUnit.toFixed(2)} ${unitTime}`,
        ``,
        `The time required to reach ${T.toFixed(2)}°${unitTemp} is ${timeInOriginalUnit.toFixed(2)} ${unitTime}.`
    ];

    displaySolution(solution.join("\n"));
}

function calculateHeatCoolInitialTemp() {
    const T_a = parseFloat(document.getElementById("ambient-temp").value);
    const t1 = parseFloat(document.getElementById("known-time1").value);
    const T1 = parseFloat(document.getElementById("known-temp1").value);
    const t2 = parseFloat(document.getElementById("known-time2").value);
    const T2 = parseFloat(document.getElementById("known-temp2").value);
    const unitTemp = document.getElementById("unit-temp").value;
    const unitTime = document.getElementById("unit-time").value;

    if (isNaN(T_a) || isNaN(t1) || isNaN(T1) || isNaN(t2) || isNaN(T2)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    // Convert temperatures to Kelvin and normalize time
    const T_aK = toKelvin(T_a, unitTemp);
    const T1K = toKelvin(T1, unitTemp);
    const T2K = toKelvin(T2, unitTemp);
    const t1InHours = normalizeTime(t1, unitTime);
    const t2InHours = normalizeTime(t2, unitTime);

    // Calculate k
    const k = -Math.log((T2K - T_aK) / (T1K - T_aK)) / (t2InHours - t1InHours);

    // Calculate initial temperature (T₀ in Kelvin)
    const T0K = (T1K - T_aK) / Math.exp(-k * t1InHours) + T_aK;

    // Convert T₀ back to the selected temperature unit
    const T0 = fromKelvin(T0K, unitTemp);

    let solution = [
        `Step 1: Solve for k`,
        `Using the formula: T = Tₐ + (T₀ - Tₐ)e^(-kt)`,
        `k = -ln((${T2K.toFixed(2)} - ${T_aK.toFixed(2)}) / (${T1K.toFixed(2)} - ${T_aK.toFixed(2)})) / (${t2InHours.toFixed(2)} - ${t1InHours.toFixed(2)})`,
        `k = ${k.toFixed(4)}`,
        ``,
        `Step 2: Solve for T₀`,
        `Using the formula: T₀ = (T - Tₐ) / e^(-kt) + Tₐ`,
        `T₀ = (${T1K.toFixed(2)} - ${T_aK.toFixed(2)}) / e^(-${k.toFixed(4)} × ${t1InHours.toFixed(2)}) + ${T_aK.toFixed(2)}`,
        `T₀ = ${T0K.toFixed(2)} K`,
        ``,
        `Converted to the selected temperature unit:`,
        `T₀ = ${T0.toFixed(2)}°${unitTemp}`,
        ``,
        `The initial temperature (T₀) is ${T0.toFixed(2)}°${unitTemp}.`
    ];

    displaySolution(solution.join("\n"));
}


function displaySolution(solution) {
    const solutionSection = document.getElementById("solution-section");
    document.getElementById("solution").innerHTML = solution.split("\n").join("<br>");
    solutionSection.classList.remove("hidden");
}
