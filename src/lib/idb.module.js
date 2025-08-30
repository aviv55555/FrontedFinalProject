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
            const tx = db.transaction(["costs"], "readwrite");
            const store = tx.objectStore("costs");

            // save cost with date in DB
            const costWithDate = {
              ...cost,
              date: new Date().toISOString()
            };

            const req = store.add(costWithDate);

            req.onsuccess = () => {
              // return only the original fields (without date)
              const { sum, currency, category, description } = cost;
              resolve({ sum, currency, category, description });
            };

            req.onerror = () => reject(req.error);
          });
        },

        /**
         * Get report for specific year + month
         * Returns report in required structure
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

              // filter only costs of this year + month
              const filtered = allCosts.filter(item => {
                const d = new Date(item.date);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
              });

              const targetRate = rates?.[currency] || 1;

              let total = 0;
              const costs = filtered.map(item => {
                const d = new Date(item.date);
                const sourceRate = rates?.[item.currency] || 1;

                // convert sum for total calculation
                const convertedSum = item.sum * (targetRate / sourceRate);
                total += convertedSum;

                return {
                  sum: item.sum,
                  currency: item.currency,
                  category: item.category,
                  description: item.description,
                  Date: { day: d.getDate() }
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
              const monthlyTotals = new Array(12).fill(0);

              allCosts.forEach(item => {
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
