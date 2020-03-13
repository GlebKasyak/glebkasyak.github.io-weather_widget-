window.onload = function() {
    const regionsNode = document.querySelector(".regions-select");
    const citiesNode = document.querySelector(".cities-select");
    const dateNode = document.querySelector(".date-select");
    const weatherWidget = document.querySelector(".weather-widget");

    const loader = document.querySelector(".loader");
    const scrim = document.querySelector(".scrim");
    const error = document.querySelector(".error");

    const by_cities_url = "https://gist.githubusercontent.com/alex-oleshkevich/6946d85bf075a6049027306538629794/raw/3986e8e1ade2d4e1186f8fee719960de32ac6955/by-cities.json";
    const weatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast";
    const apiKey = "7d4f4bd833f5f70c3ddf8149d0f111aa";

    const displayLoader = bool => {
        if(bool) {
            loader.classList.add("loader--remove");
            scrim.classList.add("scrim--remove");
        } else {
            loader.classList.remove("loader--remove");
            scrim.classList.remove("scrim--remove");
        }
    };

    const displayErrorMessage = err => {
        error.classList.add("error--show");
        error.firstChild.innerText = `Error! ${ err }`;
        scrim.classList.add("scrim--remove");
    };

    const createOptions = (value, parent) => {
        let option = document.createElement("option");
        option.innerText = `${ value }`;
        option.setAttribute("value", value);

        parent.appendChild(option);
    };

    const clearOptions = parent => {
        while(parent.querySelectorAll("option")[1]) {
            parent.removeChild(parent.lastChild)
        }
    };

    const fetchData = async () => {
      try {
        let regions = [];
        let cities = [];

        let response = await fetch(by_cities_url);
        let data =  await response.json();

        displayLoader(true);
        regions.push(...data[0].regions);

        regions.forEach(region => createOptions(region.name , regionsNode));

        regionsNode.addEventListener("change", function() {
          cities = [];
          clearOptions(citiesNode);

          regions.forEach(region => {
              if(region.name === this.value) {
                  region.cities.forEach(city => {
                      createOptions(city.name, citiesNode);
                      cities.push(city)
                  })
              }
          });
        });

        try {
          const getCityWeather = async props =>{
                const lat = props.lat.toFixed(2);
                const lng = props.lng.toFixed(2);

                const response = await fetch(`${ weatherApiUrl }?lat=${ lat }&lon=${ lng }&appid=${ apiKey }`);
                const data = await response.json();

                displayLoader(true);
                setWidgetWeather(data);
          };

            citiesNode.addEventListener("change", function() {
                clearOptions(dateNode);

                cities.forEach(city => {
                    if(city.name === this.value) {
                        displayLoader(false);
                        getCityWeather({ lat: city.lat, lng: city.lng });
                    }
                });

            });

          function setWidgetWeather(data) {
                let weatherForDay = [];
                let dateArray = [];

                data.list.filter(day => dateArray.push(day.dt_txt.split(" ")[0]));

                for(let i = 0; i < dateArray.length; i ++) {
                    if(i === 0 || dateArray[i] !== dateArray[i -1]) createOptions(dateArray[i], dateNode);
                }

                dateNode.addEventListener("change", function() {
                    let cityName = `<h1 class="weather-widget__city-name">City - ${ data.city.name }, Country - ${ data.city.country }</h1>`;

                    while(weatherWidget.children.length) {
                      weatherWidget.removeChild(weatherWidget.lastChild)
                    }

                    weatherForDay = data.list.filter(day => day.dt_txt.split(" ")[0] === this.value);
                    weatherWidget.innerHTML = cityName;

                    showWeather(weatherForDay)
                });

                function showWeather(day) {
                  day.forEach( el => {
                    const card = document.createElement("div");
                    card.classList.add("card");

                    const { icon, description } = el.weather[0];
                    const { temp, pressure, humidity } = el.main;
                    const cardIcon = `https://openweathermap.org/img/wn/${ icon }@2x.png`;

                    const cardContent = `
                        <h3 class="card__description">${ description }</h3>
                        <p class="card__speed">Wind ${ el.wind.speed } km/h</p>
                        <div class="card__sky">
                            <img src=${ cardIcon } class="card__image" alt=${ description } >
                             <h2 class="card__temp">${ Math.round(temp - 273.15) }&#8451;</h2>
                        </div>
                        <table class="card__info">
                            <tr>
                                <td>PREASSURE</td>
                                <td>HUMIDITY</td>
                            </tr>
                            <tr>
                                <td>${ pressure } &#13225;</td>
                                <td>${ humidity }% &#128167;</td>
                            </tr>
                        </table>
                    `;

                    card.innerHTML = cardContent;
                    weatherWidget.appendChild(card);
                  });

                }
          }
        } catch (error) {
          displayErrorMessage(error);
        }
      } catch (error) {
          displayErrorMessage(error);
      }
    };

    fetchData();

};