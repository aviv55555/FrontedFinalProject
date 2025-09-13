// idb.module.js - ES module for React
// IndexedDB wrapper for Cost Manager Project

export function openCostsDB(databaseName, databaseVersion) {
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

      resolve({
        /**
         * Add a cost item
         */
        addCost: (cost) => {
          return new Promise((resolve, reject) => {
            // Validation: sum must be a positive number
            if (typeof cost.sum !== "number" || cost.sum <= 0) {
              return reject(new Error("Sum must be a positive number"));
            }

            const tx = db.transaction(["costs"], "readwrite");
            const store = tx.objectStore("costs");

            const costWithDate = {
              ...cost,
              date: new Date().toISOString()
            };

            const req = store.add(costWithDate);

            req.onsuccess = () => {
              const { sum, currency, category, description } = cost;
              resolve({ sum, currency, category, description });
            };

            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Get all costs
         */
        getAllCosts: () => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(["costs"], "readonly");
            const store = tx.objectStore("costs");
            const req = store.getAll();

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Delete cost by id
         */
        deleteCost: (id) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(["costs"], "readwrite");
            const store = tx.objectStore("costs");
            const req = store.delete(id);

            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Update cost by id
         */
        updateCost: (cost) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(["costs"], "readwrite");
            const store = tx.objectStore("costs");
            const req = store.put(cost);

            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Get costs by month + year
         */
        getCostsByMonth: (year, month) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(["costs"], "readonly");
            const store = tx.objectStore("costs");
            const req = store.getAll();

            req.onsuccess = () => {
              const allCosts = req.result;
              const y = Number(year);
              const m = Number(month);

              const filtered = allCosts.filter((item) => {
                const d = new Date(item.date);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
              });

              resolve(filtered);
            };

            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Get report for specific year + month
         */
        getReport: (year, month, currency, rates) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(["costs"], "readonly");
            const store = tx.objectStore("costs");
            const req = store.getAll();

            req.onsuccess = () => {
              const allCosts = req.result;
              const y = Number(year);
              const m = Number(month);

              const filtered = allCosts.filter((item) => {
                const d = new Date(item.date);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
              });

              const targetRate = rates?.[currency] || 1;

              let total = 0;
              const costs = filtered.map((item) => {
                const d = new Date(item.date);
                const sourceRate = rates?.[item.currency] || 1;
                const convertedSum = item.sum * (targetRate / sourceRate);
                total += convertedSum;

                return {
                  sum: item.sum,
                  currency: item.currency,
                  category: item.category,
                  description: item.description,
                  date: { day: d.getDate() }
                };
              });

              const report = {
                year: y,
                month: m,
                costs,
                total: { currency, total }
              };

              resolve(report);
            };

            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Get yearly totals per month
         */
        getYearlyReport: (year, currency, rates) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(["costs"], "readonly");
            const store = tx.objectStore("costs");
            const req = store.getAll();

            req.onsuccess = () => {
              const allCosts = req.result;
              const y = Number(year);
              const targetRate = rates?.[currency] || 1;

              const monthlyTotals = Array.from({ length: 12 }, () => 0);

              allCosts.forEach((item) => {
                const d = new Date(item.date);
                if (d.getFullYear() === y) {
                  const sourceRate = rates?.[item.currency] || 1;
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

            req.onerror = () => reject(req.error);
          });
        }
      });
    };
  });
}
