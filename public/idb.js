// idb.js for vanilla JS
// IndexedDB wrapper for Cost Manager Project

// Helper function: load exchange rates from JSON URL saved in localStorage
async function loadRates() {
    const url = localStorage.getItem("exchangeRatesUrl");
    if (!url) {
        // Fallback if no URL is defined
        return { "USD": 1, "GBP": 1.8, "EURO": 0.7, "ILS": 3.4 };
    }
    try {
        const response = await fetch(url);
        if (response.status !== 200) {
            throw new Error("FetchError: Invalid status code");
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("RatesError:", err);
        // Fallback if fetch fails
        return { "USD": 1, "GBP": 1.8, "EURO": 0.7, "ILS": 3.4 };
    }
}

const idb = {
    // Open the database
    openCostsDB: function (databaseName, databaseVersion) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(databaseName, databaseVersion);

            request.onerror = () => reject("DBError: Failed to open database");

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create the 'costs' object store if it doesn't exist
                if (!db.objectStoreNames.contains("costs")) {
                    const store = db.createObjectStore("costs", {
                        keyPath: "id",
                        autoIncrement: true
                    });
                    store.createIndex("date", "date");
                    store.createIndex("category", "category");
                }
            };

            request.onsuccess = () => {
                const db = request.result;

                // API returned after DB is opened
                resolve({
                    /**
                     * Add a cost item
                     * @param {Object} cost - { sum, currency, category, description }
                     * @returns {Promise} - Resolves with the newly added cost (without date field)
                     */
                    addCost: (cost) => {
                        return new Promise((resolve, reject) => {
                            const tx = db.transaction(["costs"], "readwrite");
                            const store = tx.objectStore("costs");

                            // Save the cost with automatic date
                            const costWithDate = {
                                ...cost,
                                date: new Date().toISOString()
                            };

                            const request = store.add(costWithDate);

                            request.onsuccess = () => {
                                // Return only the required fields (without date)
                                const { sum, currency, category, description } = cost;
                                resolve({ sum, currency, category, description });
                            };

                            request.onerror = () => reject("DBError: Failed to add cost");
                        });
                    },

                    /**
                     * Get report for specific year/month in given currency
                     * Converts values to the selected currency
                     * @param {number} year 
                     * @param {number} month (1-12)
                     * @param {string} currency ("USD", "GBP", "EURO", "ILS")
                     * @returns {Promise} - Resolves with report object
                     */
                    getReport: (year, month, currency) => {
                        return new Promise(async (resolve, reject) => {
                            const rates = await loadRates(); // Load rates dynamically
                            const tx = db.transaction(["costs"], "readonly");
                            const store = tx.objectStore("costs");
                            const request = store.getAll();

                            request.onsuccess = () => {
                                const allCosts = request.result;

                                // Filter only costs for the given year + month
                                const filtered = allCosts.filter(item => {
                                    const d = new Date(item.date);
                                    return d.getFullYear() === year && (d.getMonth() + 1) === month;
                                });

                                const targetRate = rates[currency] || 1;

                                let total = 0;
                                const costs = filtered.map(item => {
                                    const sourceRate = rates[item.currency] || 1;
                                    const convertedSum = item.sum * (targetRate / sourceRate);
                                    total += convertedSum;

                                    return {
                                        sum: item.sum,
                                        currency: item.currency,
                                        category: item.category,
                                        description: item.description,
                                        Date: { day: new Date(item.date).getDate() }
                                    };
                                });

                                // Build report object
                                const report = {
                                    year: year,
                                    month: month,
                                    costs: costs,
                                    total: { currency: currency, total: total }
                                };

                                resolve(report);
                            };

                            request.onerror = () => reject("DBError: Failed to get report");
                        });
                    },

                    /**
                     * Get yearly totals per month
                     * Used for BarChart
                     * @param {number} year
                     * @param {string} currency
                     * @returns {Promise} - Resolves with totals per month
                     */
                    getYearlyReport: (year, currency) => {
                        return new Promise(async (resolve, reject) => {
                            const rates = await loadRates(); // Load rates dynamically
                            const tx = db.transaction(["costs"], "readonly");
                            const store = tx.objectStore("costs");
                            const request = store.getAll();

                            request.onsuccess = () => {
                                const allCosts = request.result;
                                const y = Number(year);

                                const targetRate = rates[currency] || 1;

                                // Initialize totals for 12 months
                                const monthlyTotals = new Array(12).fill(0);

                                // Accumulate totals per month
                                allCosts.forEach(item => {
                                    const d = new Date(item.date);
                                    if (d.getFullYear() === y) {
                                        const sourceRate = rates[item.currency] || 1;
                                        const convertedSum = item.sum * (targetRate / sourceRate);
                                        monthlyTotals[d.getMonth()] += convertedSum;
                                    }
                                });

                                resolve({
                                    year: y,
                                    currency,
                                    monthlyTotals
                                });
                            };

                            request.onerror = () => reject("DBError: Failed to get yearly report");
                        });
                    }
                });
            };
        });
    }
};

// Attach globally so it can be used in vanilla JS (non-module)
if (typeof window !== "undefined") {
    window.idb = idb;
}
