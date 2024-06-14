const filePath = './housing.json';

function getColor(price) {
    let color = null;
    if (price <= 1500) {
        color = 'red'
    } else if (1500 < price && price < 3000) {
        color = 'orange'
    } else if (price >= 3000) {
        color = 'green'
    }
    return color
}

async function fetchAndParseJSON(filePath) {
    const response = await fetch(filePath);
    const data = await response.json();
    console.log('Final object:', data);
    return data
}

async function handleDataForGraph() {
    let prices = [];
    let squareFootages = [];
    let colors = [];
    let texts = [];
    const data = await fetchAndParseJSON(filePath);
    for (let i = 0; i < data.length; i++) {
        longitude = data[i].longitude;
        latitude = data[i].latitude;
        price = data[i].price
        sqft = data[i].sqft;
        url = data[i].url; 
        color = getColor(price);
        console.log(color);
        AddMarker(longitude, latitude, color, url, price, i, data);

        prices.push(data[i].price);
        squareFootages.push(data[i].sqft);
        colors.push(color);
        texts.push(`Price: $${price}<br>Sqft: ${sqft}<br><a href="${url}" target="_blank">Link to Listing</a>`);
    }
    console.log("Scatter", prices, squareFootages)
    scatterPlot(prices, squareFootages, colors,texts);
    dataTable();

}



// Initialize Map
var map = L.map('map').setView([38.575764, -121.478851], 13);
const fileUrl = 'housing.json';

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


//https://leafletjs.com/examples/custom-icons/
function createLeafIcon(iconUrl) {
    return L.icon({
        iconUrl: iconUrl,
        shadowUrl: './js/leaf-shadow.png',
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });
}

var greenIcon = createLeafIcon('./js/leaf-green.png');
var redIcon = createLeafIcon('./js/leaf-red.png');
var orangeIcon = createLeafIcon('./js/leaf-orange.png');


function highlightScatterPoint(index, data) {
    scatterPlot(
        data.map(d => d.price),
        data.map(d => d.sqft),
        data.map(d => getColor(d.price)),
        data
    );
    const highlightedPoint = {
        x: [data[index].price],
        y: [data[index].sqft],
        mode: 'markers',
        marker: {
            size: 20,
            color: 'yellow', 
            line:{
                color:'black',
                width:2
            }
        },
        type: 'scatter'
    };

    Plotly.addTraces('scatter', highlightedPoint);
}





function AddMarker(longitude, latitude, color, url, price, index, data) {
    let icon;
    if (color === 'red') {
        icon = redIcon;
    } else if (color === 'orange') {
        icon = orangeIcon;
    } else if (color === 'green') {
        icon = greenIcon;
    }

    console.log(url)

    const marker = L.marker([latitude, longitude], {
        icon: icon,
    }).addTo(map)
        .bindPopup(
            `<a href="${url}" target="_blank">Link to Listing</a>
             <div>Price: $${price}</div>`
        )
        .openPopup();

    marker.on('click', function() {
        console.log(
            "Detected"
        )
        highlightScatterPoint(index, data);
        dataTable(data[index]);
    });
}

function scatterPlot(price, square, colors,texts) {

    var trace1 = {
        x: price,
        y: square,
        mode: 'markers',
        text: texts,
        hoverinfo: texts,
        marker: {
            color: colors,
            size: 10,
            opacity: 0.8,
        },
        type: 'scatter'
    };

    var data = [trace1];

    // TODO: Legends of plot, etc 
    var layout = {
        xaxis: {
            title: "price"
        },
        yaxis: {
            title: "squares"
        },
        title: 'Price Vs. Squares'
    };


    Plotly.newPlot('scatter', data, layout);

}

function dataTable(selectedData = null) {
    const defaultValues = {
        title: 'N/A',
        price: 'N/A',
        sqft: 'N/A',
        bedrooms: 'N/A',
        airconditioning: 'N/A',
        application_fee_explained: 'N/A',
        datePosted: 'N/A',
        latitude: 'N/A',
        laundry: 'N/A',
        longitude: 'N/A',
        name: 'N/A',
        numberOfBathroomsTotal: 'N/A',
        numberOfBedrooms: 'N/A',
        parking: 'N/A',
        pets_cat: 'N/A',
        pets_dog: 'N/A',
        petsAllowed: 'N/A',
        rent_period: 'N/A',
        type: 'N/A',
        postalCode: 'N/A',
        addressLocality: 'N/A',
        streetAddress: 'N/A'
    };

    const values = selectedData ? [
        ["title", selectedData.title],
        ["price", selectedData.price],
        ["sqft", selectedData.sqft],
        ["bedrooms", selectedData.bedrooms],
        ["airconditioning", selectedData.airconditioning],
        ["application_fee_explained", selectedData.application_fee_explained],
        ["datePosted", selectedData.datePosted],
        ["latitude", selectedData.latitude],
        ["laundry", selectedData.laundry],
        ["longitude", selectedData.longitude],
        ["name", selectedData.name],
        ["numberOfBathroomsTotal", selectedData.numberOfBathroomsTotal],
        ["numberOfBedrooms", selectedData.numberOfBedrooms],
        ["parking", selectedData.parking],
        ["pets_cat", selectedData.pets_cat],
        ["pets_dog", selectedData.pets_dog],
        ["petsAllowed", selectedData.petsAllowed],
        ["rent_period", selectedData.rent_period],
        ["type", selectedData.type],
        ["postalCode", selectedData.postalCode],
        ["addressLocality", selectedData.addressLocality],
        ["streetAddress", selectedData.streetAddress]
    ] : Object.entries(defaultValues).map(([key, value]) => [key, value]);

    var data = [{
        type: 'table',
        header: {
            values: [["<b>Description</b>"]],
            align: ["left", "center"],
            line: { width: 1, color: '#506784' },
            fill: { color: '#119DFF' },
            font: { family: "Arial", size: 12, color: "white" }
        },
        cells: {
            values: [
                values.map(item => item[0]), 
                values.map(item => item[1])  
            ],
            align: ["left", "center"],
            line: { color: "#506784", width: 1 },
            fill: { color: ['#25FEFD', 'white'] },
            font: { family: "Arial", size: 14, color: ["#506784"] }
        }
    }]
    Plotly.newPlot('table', data);
}



handleDataForGraph();


