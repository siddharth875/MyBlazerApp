// 🚀 PRODUCTION CIF + CIFInitDone + Local Fallback
let cifReady = false;

// Wait for CIFInitDone event
window.addEventListener("CIFInitDone", () => {
    console.log("✅ CIFInitDone - APIs READY");
    cifReady = true;
});

// Fallback detection
setTimeout(() => {
    if (!cifReady && window.Microsoft?.CIFramework) cifReady = true;
}, 2000);

window.CIFDemo = {
    getRecordContext: async () => {
        if (!cifReady || !window.Microsoft?.CIFramework?.getEnvironment) {
            return null;
        }
        try {
            const env = JSON.parse(await Microsoft.CIFramework.getEnvironment());
            return {
                method: 'getEnvironment',
                entity: env.entityLogicalName || null,
                id: env.id,
                pageType: env.pageType
            };
        } catch (e) {
            console.error('CIF Error:', e);
            return null;
        }
    },

    testAll: async () => {
        const results = {
            cifReady,
            cifAvailable: !!window.Microsoft?.CIFramework,
            context: await window.CIFDemo.getRecordContext()
        };
        console.table(results);
        return results;
    }
};

// Production Blazor interop function
window.getCifRecordContext = async () => {
    // Wait max 5s for CIF
    let attempts = 0;
    while (!cifReady && attempts++ < 50) {
        await new Promise(r => setTimeout(r, 100));
    }

    const cifResult = await window.CIFDemo.getRecordContext();

    // Local dev fallback ?etn=account&id=guid
    if (!cifResult) {
        const params = new URLSearchParams(window.location.search);
        const etn = params.get('etn');
        const id = params.get('id');
        if (etn && id) {
            return { entity: etn, id, method: 'local' };
        }
    }

    return cifResult || null;
};
