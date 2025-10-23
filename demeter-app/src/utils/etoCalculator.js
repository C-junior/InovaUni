/**
 * FAO-56 Penman-Monteith ETo Calculator
 * Calculates reference evapotranspiration for Palmas (TO), Brazil
 * Fixed coordinates: Latitude 10°S, Altitude 230m
 */

// Fixed location parameters for Palmas (TO)
const PALMAS_LATITUDE = -10.0; // degrees (negative for southern hemisphere)
const PALMAS_ALTITUDE = 230; // meters above sea level

/**
 * Calculate reference evapotranspiration (ETo) using FAO-56 Penman-Monteith method
 * @param {Object} inputs - Weather data inputs
 * @param {number} inputs.tmax - Maximum temperature (°C)
 * @param {number} inputs.tmin - Minimum temperature (°C)
 * @param {number} inputs.humidity - Relative humidity (%)
 * @param {number} inputs.windSpeed - Wind speed at 2m height (m/s)
 * @param {number} inputs.solarRadiation - Solar radiation (MJ/m²/day)
 * @param {number} inputs.julianDay - Day of year (1-365/366)
 * @returns {Object} Calculation result with ETo value and intermediate steps
 */
export function calculateETo(inputs) {
  try {
    // Validate inputs
    validateInputs(inputs);

    const { tmax, tmin, humidity, windSpeed, solarRadiation, julianDay } = inputs;

    // Step 1: Calculate mean temperature
    const tmean = (tmax + tmin) / 2;

    // Step 2: Calculate slope of saturation vapor pressure curve (Δ) [kPa/°C]
    const delta =
      (4098 * (0.6108 * Math.exp((17.27 * tmean) / (tmean + 237.3)))) / Math.pow(tmean + 237.3, 2);

    // Step 3: Calculate atmospheric pressure (P) [kPa]
    const pressure = 101.3 * Math.pow((293 - 0.0065 * PALMAS_ALTITUDE) / 293, 5.26);

    // Step 4: Calculate psychrometric constant (γ) [kPa/°C]
    const gamma = 0.665 * pressure;

    // Step 5: Calculate saturation vapor pressure (es) [kPa]
    const es_tmax = 0.6108 * Math.exp((17.27 * tmax) / (tmax + 237.3));
    const es_tmin = 0.6108 * Math.exp((17.27 * tmin) / (tmin + 237.3));
    const es = (es_tmax + es_tmin) / 2;

    // Step 6: Calculate actual vapor pressure (ea) [kPa]
    const ea = (humidity / 100) * es;

    // Step 7: Calculate net radiation components
    const radiationComponents = calculateNetRadiation(solarRadiation, tmax, tmin, ea, julianDay);
    const { rn, rns, rnl } = radiationComponents;

    // Step 8: Calculate soil heat flux (G) [MJ/m²/day] - assumed 0 for daily calculations
    const soilHeatFlux = 0;

    // Step 9: Calculate wind speed at 2m height (u2) [m/s]
    const u2 = windSpeed; // Assuming input is already at 2m height

    // Step 10: Calculate ETo using Penman-Monteith equation [mm/day]
    const numerator1 = 0.408 * delta * (rn - soilHeatFlux);
    const numerator2 = gamma * (900 / (tmean + 273)) * u2 * (es - ea);
    const denominator = delta + gamma * (1 + 0.34 * u2);

    const eto = (numerator1 + numerator2) / denominator;

    // Prepare intermediate values for transparency
    const intermediateValues = {
      tmean: roundToDecimals(tmean, 2),
      delta: roundToDecimals(delta, 4),
      pressure: roundToDecimals(pressure, 2),
      gamma: roundToDecimals(gamma, 4),
      es_tmax: roundToDecimals(es_tmax, 4),
      es_tmin: roundToDecimals(es_tmin, 4),
      es: roundToDecimals(es, 4),
      ea: roundToDecimals(ea, 4),
      rn: roundToDecimals(rn, 2),
      rns: roundToDecimals(rns, 2),
      rnl: roundToDecimals(rnl, 2),
      u2: roundToDecimals(u2, 2),
      soilHeatFlux: roundToDecimals(soilHeatFlux, 2),
      numerator1: roundToDecimals(numerator1, 4),
      numerator2: roundToDecimals(numerator2, 4),
      denominator: roundToDecimals(denominator, 4),
    };

    return {
      eto: roundToDecimals(Math.max(0, eto), 2), // Ensure non-negative result
      intermediateValues,
      inputs: {
        ...inputs,
        latitude: PALMAS_LATITUDE,
        altitude: PALMAS_ALTITUDE,
      },
      calculationDate: new Date().toISOString(),
      location: "Palmas (TO), Brazil",
    };
  } catch (error) {
    throw new Error(`ETo calculation failed: ${error.message}`);
  }
}

/**
 * Calculate net radiation components
 * @param {number} rs - Solar radiation (MJ/m²/day)
 * @param {number} tmax - Maximum temperature (°C)
 * @param {number} tmin - Minimum temperature (°C)
 * @param {number} ea - Actual vapor pressure (kPa)
 * @param {number} julianDay - Day of year
 * @returns {Object} Net radiation components
 */
function calculateNetRadiation(rs, tmax, tmin, ea, julianDay) {
  // Solar declination (δ) [radians]
  const solarDeclination = 0.409 * Math.sin(((2 * Math.PI) / 365) * julianDay - 1.39);

  // Convert latitude to radians
  const latRad = (Math.PI / 180) * PALMAS_LATITUDE;

  // Sunset hour angle (ωs) [radians]
  const sunsetHourAngle = Math.acos(-Math.tan(latRad) * Math.tan(solarDeclination));

  // Extraterrestrial radiation (Ra) [MJ/m²/day]
  const dr = 1 + 0.033 * Math.cos(((2 * Math.PI) / 365) * julianDay);
  const ra =
    ((24 * 60) / Math.PI) *
    0.082 *
    dr *
    (sunsetHourAngle * Math.sin(latRad) * Math.sin(solarDeclination) +
      Math.cos(latRad) * Math.cos(solarDeclination) * Math.sin(sunsetHourAngle));

  // Clear sky solar radiation (Rso) [MJ/m²/day]
  const rso = (0.75 + 2e-5 * PALMAS_ALTITUDE) * ra;

  // Net shortwave radiation (Rns) [MJ/m²/day]
  const albedo = 0.23; // Grass reference crop albedo
  const rns = (1 - albedo) * rs;

  // Net longwave radiation (Rnl) [MJ/m²/day]
  const stefanBoltzmann = 4.903e-9; // MJ K⁻⁴ m⁻² day⁻¹
  const tmaxK = tmax + 273.16;
  const tminK = tmin + 273.16;
  const cloudinessFactor = 1.35 * Math.min(rs / rso, 1.0) - 0.35;
  const vaporPressureFactor = 0.34 - 0.14 * Math.sqrt(ea);

  const rnl =
    stefanBoltzmann *
    ((Math.pow(tmaxK, 4) + Math.pow(tminK, 4)) / 2) *
    vaporPressureFactor *
    cloudinessFactor;

  // Net radiation (Rn) [MJ/m²/day]
  const rn = rns - rnl;

  return {
    rn,
    rns,
    rnl,
    ra: roundToDecimals(ra, 2),
    rso: roundToDecimals(rso, 2),
    solarDeclination: roundToDecimals(solarDeclination, 4),
    sunsetHourAngle: roundToDecimals(sunsetHourAngle, 4),
  };
}

/**
 * Validate input parameters
 * @param {Object} inputs - Input parameters to validate
 */
function validateInputs(inputs) {
  const { tmax, tmin, humidity, windSpeed, solarRadiation, julianDay } = inputs;

  // Check for required parameters
  if (typeof tmax !== "number" || typeof tmin !== "number") {
    throw new Error("Temperature values (tmax, tmin) must be numbers");
  }

  if (typeof humidity !== "number") {
    throw new Error("Humidity must be a number");
  }

  if (typeof windSpeed !== "number") {
    throw new Error("Wind speed must be a number");
  }

  if (typeof solarRadiation !== "number") {
    throw new Error("Solar radiation must be a number");
  }

  if (typeof julianDay !== "number") {
    throw new Error("Julian day must be a number");
  }

  // Validate ranges
  if (tmax < tmin) {
    throw new Error("Maximum temperature cannot be less than minimum temperature");
  }

  if (tmax < -50 || tmax > 60) {
    throw new Error("Maximum temperature must be between -50°C and 60°C");
  }

  if (tmin < -50 || tmin > 60) {
    throw new Error("Minimum temperature must be between -50°C and 60°C");
  }

  if (humidity < 0 || humidity > 100) {
    throw new Error("Humidity must be between 0% and 100%");
  }

  if (windSpeed < 0 || windSpeed > 50) {
    throw new Error("Wind speed must be between 0 and 50 m/s");
  }

  if (solarRadiation < 0 || solarRadiation > 50) {
    throw new Error("Solar radiation must be between 0 and 50 MJ/m²/day");
  }

  if (julianDay < 1 || julianDay > 366) {
    throw new Error("Julian day must be between 1 and 366");
  }
}

/**
 * Round number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
function roundToDecimals(value, decimals) {
  if (typeof value !== "number" || isNaN(value)) {
    return 0;
  }
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get current Julian day (day of year)
 * @param {Date} date - Date object (defaults to current date)
 * @returns {number} Julian day (1-365/366)
 */
export function getJulianDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Create sample calculation inputs for testing
 * @returns {Object} Sample inputs for ETo calculation
 */
export function createSampleInputs() {
  return {
    tmax: 32.5,
    tmin: 22.8,
    humidity: 65,
    windSpeed: 2.1,
    solarRadiation: 15,
    julianDay: getJulianDay(),
  };
}
