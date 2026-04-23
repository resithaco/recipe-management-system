const locationText = document.getElementById("locationText");

if (navigator.geolocation) {
    // إضافة خيار enableHighAccuracy للحصول على أدق إحداثيات ممكنة
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
            // إضافة accept-language لضمان الحصول على الأسماء بلغة معينة إذا أردت
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
            );
            const data = await response.json();
            console.log(data);

            const addr = data.address;

            // استخراج البيانات بشكل أكثر ذكاءً
            // الشارع قد يكون في حقل road أو house_number
            const street = addr.road || addr.street || "";
            
            // الحي (District/Neighborhood)
            const neighborhood = addr.suburb || addr.neighbourhood || addr.village || "";
            
            // المدينة أو المركز
            const city = addr.city || addr.town || addr.province || "";

            // صياغة النص النهائي: إذا وجد الشارع نعرضه، وإلا نكتفي بالحي والمدينة
            if (street || neighborhood) {
                locationText.textContent = `${neighborhood} ${street}, ${city}`.trim();
            } else {
                locationText.textContent = data.display_name.split(',').slice(0, 2).join(', ');
            }

        } catch (err) {
            console.error(err);
            locationText.textContent = "Konum alınamadى";
        }
    }, (error) => {
        locationText.textContent = "Konum izni reddedildi";
    }, options);
}