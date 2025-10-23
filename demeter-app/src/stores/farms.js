import { defineStore } from "pinia";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  getUserFarmsCollection,
  getFarmDoc,
  getFarmCalculationsCollection,
  getFarmCalculationDoc,
  addTimestamp,
  addUpdateTimestamp,
} from "../services/firestore.js";

export const useFarmsStore = defineStore("farms", {
  state: () => ({
    farms: [],
    currentFarm: null,
    calculations: [],
    calculationHistory: {},
    loading: false,
    error: null,
  }),

  getters: {
    farmCount: (state) => state.farms.length,
    getFarmById: (state) => (id) => state.farms.find((farm) => farm.id === id),
    sortedFarms: (state) => [...state.farms].sort((a, b) => a.name.localeCompare(b.name)),
    getFarmCalculations: (state) => (farmId) => state.calculationHistory[farmId] || [],
    getLatestCalculation: (state) => (farmId) => {
      const calculations = state.calculationHistory[farmId] || [];
      return calculations.length > 0 ? calculations[0] : null;
    },
  },

  actions: {
    /**
     * Fetch all farms for the current user
     */
    async fetchFarms() {
      try {
        this.loading = true;
        this.error = null;

        console.log("🔍 Getting farms collection...");
        const farmsCollection = getUserFarmsCollection();
        console.log("🔍 Farms collection:", farmsCollection);

        console.log("🔍 Creating query...");
        const q = query(farmsCollection, orderBy("createdAt", "desc"));

        console.log("🔍 Executing query...");
        const querySnapshot = await getDocs(q);
        console.log("🔍 Query result - docs found:", querySnapshot.docs.length);

        this.farms = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("🔍 Farm doc data:", { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data,
          };
        });
        console.log("🔍 Farms mapped successfully:", this.farms.length);
        console.log("🔍 Setting loading to false...");

        // Force loading to false with a small delay to ensure reactivity
        setTimeout(() => {
          this.loading = false;
          console.log("🔍 Loading state after timeout:", this.loading);
        }, 100);
      } catch (error) {
        console.error("❌ Error in fetchFarms:", error);
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    /**
     * Add a new farm
     * @param {Object} farmData - Farm data object
     * @param {string} farmData.name - Farm name
     * @param {number} farmData.area - Farm area in hectares
     * @param {string} farmData.soilType - Soil type (arenoso, argiloso, humoso)
     */
    async addFarm(farmData) {
      try {
        this.loading = true;
        this.error = null;

        // Validate farm data
        this.validateFarmData(farmData);

        const farmsCollection = getUserFarmsCollection();
        const farmWithTimestamp = addTimestamp(farmData);

        const docRef = await addDoc(farmsCollection, farmWithTimestamp);

        const newFarm = {
          id: docRef.id,
          ...farmWithTimestamp,
        };

        this.farms.unshift(newFarm);
        return newFarm;
      } catch (error) {
        this.error = error.message;
        console.error("Error adding farm:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update an existing farm
     * @param {string} farmId - Farm ID
     * @param {Object} farmData - Updated farm data
     */
    async updateFarm(farmId, farmData) {
      try {
        this.loading = true;
        this.error = null;

        // Validate farm data
        this.validateFarmData(farmData);

        const farmDoc = getFarmDoc(farmId);
        const updatedData = addUpdateTimestamp(farmData);

        await updateDoc(farmDoc, updatedData);

        // Update local state
        const farmIndex = this.farms.findIndex((farm) => farm.id === farmId);
        if (farmIndex !== -1) {
          this.farms[farmIndex] = {
            ...this.farms[farmIndex],
            ...updatedData,
          };
        }

        return this.farms[farmIndex];
      } catch (error) {
        this.error = error.message;
        console.error("Error updating farm:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a farm
     * @param {string} farmId - Farm ID
     */
    async deleteFarm(farmId) {
      try {
        this.loading = true;
        this.error = null;

        const farmDoc = getFarmDoc(farmId);
        await deleteDoc(farmDoc);

        // Remove from local state
        this.farms = this.farms.filter((farm) => farm.id !== farmId);

        // Clear current farm if it was deleted
        if (this.currentFarm?.id === farmId) {
          this.currentFarm = null;
        }
      } catch (error) {
        this.error = error.message;
        console.error("Error deleting farm:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Get a specific farm by ID
     * @param {string} farmId - Farm ID
     */
    async getFarm(farmId) {
      try {
        this.loading = true;
        this.error = null;

        const farmDoc = getFarmDoc(farmId);
        const docSnap = await getDoc(farmDoc);

        if (docSnap.exists()) {
          const farm = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          this.currentFarm = farm;
          return farm;
        } else {
          throw new Error("Farm not found");
        }
      } catch (error) {
        this.error = error.message;
        console.error("Error getting farm:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Set current farm
     * @param {Object} farm - Farm object
     */
    setCurrentFarm(farm) {
      this.currentFarm = farm;
    },

    /**
     * Clear current farm
     */
    clearCurrentFarm() {
      this.currentFarm = null;
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Save calculation result to Firestore
     * @param {string} farmId - Farm ID
     * @param {Object} calculationData - Calculation result data
     */
    async saveCalculation(farmId, calculationData) {
      try {
        this.loading = true;
        this.error = null;

        // Validate calculation data
        this.validateCalculationData(calculationData);

        const calculationsCollection = getFarmCalculationsCollection(farmId);

        // Prepare calculation record
        const calculationRecord = {
          farmId,
          date: calculationData.result.calculationDate,
          inputs: {
            tmax: calculationData.inputs.tmax,
            tmin: calculationData.inputs.tmin,
            humidity: calculationData.inputs.humidity,
            windSpeed: calculationData.inputs.windSpeed,
            solarRadiation: calculationData.inputs.solarRadiation,
            julianDay: calculationData.inputs.julianDay,
            latitude: calculationData.result.inputs.latitude,
            altitude: calculationData.result.inputs.altitude,
          },
          intermediateValues: calculationData.result.intermediateValues,
          result: {
            eto: calculationData.result.eto,
          },
          dataSource: calculationData.dataSource || "manual",
          location: calculationData.result.location,
          ...addTimestamp({}),
        };

        const docRef = await addDoc(calculationsCollection, calculationRecord);

        const newCalculation = {
          id: docRef.id,
          ...calculationRecord,
        };

        // Update local state
        if (!this.calculationHistory[farmId]) {
          this.calculationHistory[farmId] = [];
        }
        this.calculationHistory[farmId].unshift(newCalculation);

        return newCalculation;
      } catch (error) {
        this.error = error.message;
        console.error("Error saving calculation:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch calculation history for a specific farm
     * @param {string} farmId - Farm ID
     * @param {number} limitCount - Maximum number of calculations to fetch (default: 50)
     */
    async fetchFarmCalculations(farmId, limitCount = 50) {
      try {
        this.loading = true;
        this.error = null;

        const calculationsCollection = getFarmCalculationsCollection(farmId);
        const q = query(calculationsCollection, orderBy("createdAt", "desc"), limit(limitCount));

        const querySnapshot = await getDocs(q);

        const calculations = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update local state
        this.calculationHistory[farmId] = calculations;

        return calculations;
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching farm calculations:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a specific calculation
     * @param {string} farmId - Farm ID
     * @param {string} calculationId - Calculation ID
     */
    async deleteCalculation(farmId, calculationId) {
      try {
        this.loading = true;
        this.error = null;

        const calculationDoc = getFarmCalculationDoc(farmId, calculationId);
        await deleteDoc(calculationDoc);

        // Update local state
        if (this.calculationHistory[farmId]) {
          this.calculationHistory[farmId] = this.calculationHistory[farmId].filter(
            (calc) => calc.id !== calculationId
          );
        }
      } catch (error) {
        this.error = error.message;
        console.error("Error deleting calculation:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Get calculation statistics for a farm
     * @param {string} farmId - Farm ID
     * @returns {Object} Statistics object
     */
    getFarmCalculationStats(farmId) {
      const calculations = this.calculationHistory[farmId] || [];

      if (calculations.length === 0) {
        return {
          count: 0,
          averageEto: 0,
          minEto: 0,
          maxEto: 0,
          lastCalculationDate: null,
        };
      }

      const etoValues = calculations.map((calc) => calc.result.eto);
      const sum = etoValues.reduce((acc, val) => acc + val, 0);

      return {
        count: calculations.length,
        averageEto: sum / calculations.length,
        minEto: Math.min(...etoValues),
        maxEto: Math.max(...etoValues),
        lastCalculationDate: calculations[0].date,
      };
    },

    /**
     * Clear calculation history for a farm
     * @param {string} farmId - Farm ID
     */
    clearFarmCalculationHistory(farmId) {
      if (this.calculationHistory[farmId]) {
        delete this.calculationHistory[farmId];
      }
    },

    /**
     * Validate calculation data
     * @param {Object} calculationData - Calculation data to validate
     */
    validateCalculationData(calculationData) {
      if (!calculationData || typeof calculationData !== "object") {
        throw new Error("Dados de cálculo são obrigatórios");
      }

      if (!calculationData.result || typeof calculationData.result.eto !== "number") {
        throw new Error("Resultado ETo é obrigatório");
      }

      if (!calculationData.inputs || typeof calculationData.inputs !== "object") {
        throw new Error("Parâmetros de entrada são obrigatórios");
      }

      const requiredInputs = [
        "tmax",
        "tmin",
        "humidity",
        "windSpeed",
        "solarRadiation",
        "julianDay",
      ];
      for (const input of requiredInputs) {
        if (typeof calculationData.inputs[input] !== "number") {
          throw new Error(`Parâmetro ${input} é obrigatório e deve ser um número`);
        }
      }
    },

    /**
     * Validate farm data
     * @param {Object} farmData - Farm data to validate
     */
    validateFarmData(farmData) {
      const { name, area, soilType } = farmData;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error("Nome da fazenda é obrigatório");
      }

      if (!area || typeof area !== "number" || area <= 0) {
        throw new Error("Área deve ser um número maior que zero");
      }

      const validSoilTypes = ["arenoso", "argiloso", "humoso"];
      if (!soilType || !validSoilTypes.includes(soilType)) {
        throw new Error("Tipo de solo deve ser: arenoso, argiloso ou humoso");
      }
    },
  },
});
