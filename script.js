/**
 * Hassan Gomaa | Portfolio 2026 - Gold & Currency Module
 * نظام متكامل لجلب الأسعار مع الأنيميشن والرسم البياني
 */

let goldChart; // متغير لتخزين الرسم البياني

document.addEventListener("DOMContentLoaded", async function () {
    // تشغيل جلب البيانات عند تحميل الصفحة
    await updateFullMarketData();

    // تحديث البيانات تلقائياً كل 5 دقائق
    setInterval(updateFullMarketData, 5 * 60 * 1000);
});

// 1. الدالة الرئيسية لجلب وتوزيع البيانات
async function updateFullMarketData() {
    try {
        // --- جلب أسعار العملات ---
        const currencyRes = await fetch("https://currency.sagha.workers.dev/currency");
        const currencyData = await currencyRes.json();
        const rates = currencyData.rates;

        // سعر دولار الصاغة (EGP) هو المحرك الأساسي
        const usdToEgp = parseFloat(rates.EGP);

        // حساب وتحديث العملات بالأنيميشن
        animateValue("usd-val", usdToEgp);
        animateValue("eur-val", usdToEgp / rates.EUR);
        animateValue("kwd-val", usdToEgp / rates.KWD);
        animateValue("sar-val", usdToEgp / rates.SAR);
        animateValue("jod-val", usdToEgp / rates.JOD);

        // --- جلب أسعار الذهب ---
        const goldRes = await fetch("https://gold.sagha.workers.dev/gold");
        const goldData = await goldRes.json();
        const globalOunce = parseFloat(goldData.price);

        // معادلة الذهب المصري: (العالمي * دولار الصاغة) / 31.1
        const gram24 = (globalOunce * usdToEgp) / 31.1;
        const gram21 = gram24 * 0.875;
        const gram18 = gram24 * 0.75;

        // تحديث الذهب بالأنيميشن
        animateValue("gold-24", gram24);
        animateValue("gold-21", gram21);
        animateValue("gold-18", gram18);

        // --- تحديث الرسم البياني ---
        renderGoldChart(Math.round(gram21));

    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// 2. دالة أنيميشن عداد الأرقام (Counter Animation)
function animateValue(id, value) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startValue = 0;
    let endValue = value;
    let duration = 1500; // مدة الحركة 1.5 ثانية
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // عرض الرقم مع تنسيق الفواصل والكسور للعملات
        let currentNum = progress * (endValue - startValue) + startValue;
        
        if (id.includes('val')) {
            // العملات تظهر بكسرين عشريين
            obj.innerHTML = currentNum.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            // الذهب يظهر كأرقام صحيحة
            obj.innerHTML = Math.round(currentNum).toLocaleString('ar-EG');
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 3. دالة الرسم البياني (Chart.js)
function renderGoldChart(currentPrice) {
    const ctx = document.getElementById('goldChart');
    if (!ctx) return;

    // محاكاة حركة السعر خلال اليوم بناءً على السعر اللحظي
    const mockHistory = [
        currentPrice - 15, 
        currentPrice + 10, 
        currentPrice - 5, 
        currentPrice + 25, 
        currentPrice - 10, 
        currentPrice
    ];

    if (goldChart) goldChart.destroy(); // حذف الرسم القديم لتجنب التداخل

    goldChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['10ص', '12م', '2م', '4م', '6م', 'الآن'],
            datasets: [{
                label: 'سعر عيار 21',
                data: mockHistory,
                borderColor: '#ffcc00', // لون ذهبي نيون
                backgroundColor: 'rgba(255, 204, 0, 0.05)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#ffcc00'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    display: false // إخفاء محور الصادات لمظهر عصري
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888', font: { family: 'Cairo' } }
                }
            }
        }
    });
}
