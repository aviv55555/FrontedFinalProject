// idb.js for vanilla JS
// IndexedDB wrapper for Cost Manager Project

const idb = {
    // Open the database
    openCostsDB: function (databaseName, databaseVersion) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(databaseName, databaseVersion);

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

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
                     * @returns {Promise} - Resolves with the newly added cost object
                     */
                    addCost: (cost) => {
                        return new Promise((resolve, reject) => {
                            const tx = db.transaction(["costs"], "readwrite");
                            const store = tx.objectStore("costs");

                            const costWithDate = {
                                ...cost,
                                date: new Date().toISOString()
                            };

                            const request = store.add(costWithDate);

                            request.onsuccess = () => resolve(costWithDate);
                            request.onerror = () => reject(request.error);
                        });
                    },

                    /**
                     * Get report for specific year/month in given currency
                     * @param {number} year 
                     * @param {number} month (1-12)
                     * @param {string} currency ("USD", "GBP", "EURO", "ILS")
                     * @returns {Promise} - Resolves with report object
                     */
                    getReport: (year, month, currency) => {
                        return new Promise((resolve, reject) => {
                            const tx = db.transaction(["costs"], "readonly");
                            const store = tx.objectStore("costs");
                            const request = store.getAll();

                            request.onsuccess = () => {
                                const allCosts = request.result;

                                const filtered = allCosts.filter(item => {
                                    const d = new Date(item.date);
                                    return d.getFullYear() === year && (d.getMonth() + 1) === month;
                                });

                                const rates = { "USD": 1, "GBP": 1.8, "EURO": 0.7, "ILS": 3.4 };
                                const targetRate = rates[currency] || 1;

                                let total = 0;
                                const costs = filtered.map(item => {
                                    const convertedSum = item.sum * (targetRate / rates[item.currency]);
                                    total += convertedSum;

                                    return {
                                        sum: item.sum,
                                        currency: item.currency,
                                        category: item.category,
                                        description: item.description,
                                        Date: { day: new Date(item.date).getDate() }
                                    };
                                });

                                const report = {
                                    year: year,
                                    month: month,
                                    costs: costs,
                                    total: { currency: currency, total: total }
                                };

                                resolve(report);
                            };

                            request.onerror = () => reject(request.error);
                        });
                    }
                });
            };
        });
    }
};

// Attach globally
if (typeof window !== "undefined") {
    window.idb = idb;
}
