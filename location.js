const locationText = document.getElementById("locationText");
if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async(position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                );
                const data = await response.json();
                console.log(data)
                const town = 
                data.address.town||
                "bilinmeyen konum";
                const city_district = 
                data.address.city_district||
                "bilinmeyen konum";
                locationText.textContent = `${town}/${city_district}`;
            } catch (err) {
                locationText.textContent = "konum alınamadı";
            }
        });
} 