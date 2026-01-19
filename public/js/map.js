console.log("map.js loaded");

//  Get map container
const mapDiv = document.getElementById("map");

if (!mapDiv) {
  console.log("Map div not found");
} else {

  //  Read location text from data attribute
  const locationText = mapDiv.dataset.location;
  console.log("Location:", locationText);

  //  Convert text location → lat/lng (OpenStreetMap)
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationText)}`,
    {
      headers: {
        "Accept-Language": "en"
      }
    }
  )
    .then(res => res.json())
    .then(searchData => {
      if (!searchData || searchData.length === 0) {
        throw new Error("Location not found");
      }

      const lat = parseFloat(searchData[0].lat);
      const lon = parseFloat(searchData[0].lon);

      //  Reverse geocode → human readable details
      return fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      )
        .then(res => res.json())
        .then(reverseData => ({ lat, lon, reverseData }));
    })
    .then(({ lat, lon, reverseData }) => {

      const address = reverseData.address || {};

      const landmark =
        address.attraction ||
        address.amenity ||
        address.tourism ||
        address.shop ||
        address.neighbourhood ||
        address.suburb ||
        "Well known area nearby";

      //  Popup HTML (Booking style)
      const popupHTML = `
        <div style="font-size:13px; line-height:1.5">
          <strong>📍 Location Details</strong><br>
          <strong>Near:</strong> ${landmark}<br>
          ${address.road ? `Road: ${address.road}<br>` : ""}
          ${address.city || address.town ? `City: ${address.city || address.town}<br>` : ""}
          ${address.state ? `State: ${address.state}<br>` : ""}
          ${address.country ? `Country: ${address.country}<br>` : ""}
          <small style="color:#666">
            Exact location will be shared after booking
          </small>
        </div>
      `;

      // Create map (Google-like clean style)
      const map = new maplibregl.Map({
        container: "map",
        style: "https://tiles.stadiamaps.com/styles/osm_bright.json",
        center: [lon, lat],
        zoom: 8
      });

      //  Zoom + rotate controls
      map.addControl(new maplibregl.NavigationControl());

      // Marker
      new maplibregl.Marker({ color: "#dc3545" })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHTML))
        .addTo(map);

      //  Approximate location circle (Airbnb style)
      map.on("load", () => {
        map.addSource("approx", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lon, lat]
            }
          }
        });

        map.addLayer({
          id: "approx-circle",
          type: "circle",
          source: "approx",
          paint: {
            "circle-radius": 20000,
            "circle-color": "#4a90e2",
            "circle-opacity": 0.15
          }
        });
      });
    })
    .catch(err => {
      console.error("Map error:", err);
    });
}
