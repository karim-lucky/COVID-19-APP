"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2"; 
import CountUp from "react-countup";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement, 
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Spinner from "../spinner/spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement, 
  Title,
  Tooltip,
  Legend
);

interface CovidData {
  cases: number;
  recovered: number;
  deaths: number;
  active: number;
  updated: number;
}

export default function CovidApp() {
  const [data, setData] = useState<CovidData | null>(null);
  const [dailyData, setDailyData] = useState<any[]>([]); 
  const [country, setCountry] = useState("all");
  const [countries, setCountries] = useState<any[]>([]); 
  const [visibleData, setVisibleData] = useState<any[]>([]); 
  const pageSize = 32;

  
  useEffect(() => {
    setVisibleData(dailyData.slice(0, pageSize));
  }, [dailyData]);

  // Fetch global or country-specific data
  useEffect(() => {
     
    const fetchData = async () => {
      try {
        // Fetch countries list for the dropdown
        const countriesResp = await axios.get("https://disease.sh/v3/covid-19/countries");
        setCountries(countriesResp.data);

        // Fetch global or specific country data based on selection
        const url = country === "all"
          ? "https://disease.sh/v3/covid-19/all"
          : `https://disease.sh/v3/covid-19/countries/${country}`;

        const resp = await axios.get(url);
        setData(resp.data);

        // Fetch historical data for daily differences
        const dailyUrl = country === "all"
          ? "https://disease.sh/v3/covid-19/historical/all"
          : `https://disease.sh/v3/covid-19/historical/${country} `;

        const dailyResp = await axios.get(dailyUrl);

        const processDailyData = (dailyData: any) => {
          const dates = Object.keys(dailyData.cases);
          const dailyFormatted = [];

          for (let i = 1; i < dates.length; i++) {
            const current = dates[i];
            const previous = dates[i - 1];

            const totalCases = dailyData.cases[current];
            const totalDeaths = dailyData.deaths[current];
            const previousTotalCases = dailyData.cases[previous];
            const previousTotalDeaths = dailyData.deaths[previous];

            // Calculate daily changes
            const dailyPositive = totalCases - previousTotalCases;
            const dailyDeaths = totalDeaths - previousTotalDeaths;

            // Calculate recovered cases: total cases - deaths
            const dailyRecovered = dailyPositive - dailyDeaths;

            dailyFormatted.push({
              dateChecked: current,
              positive: dailyPositive,
              death: dailyDeaths,
              recovered: dailyRecovered,
            });
          }

          return dailyFormatted;
        };

        if (country === "all") {
          const globalDailyData = processDailyData(dailyResp.data);
          setDailyData(globalDailyData);
        } else {
          const countryDailyData = dailyResp.data.timeline;
          const countryDailyFormatted = processDailyData(countryDailyData);
          setDailyData(countryDailyFormatted);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [country]);

  const handleCountryChange = (e:any) => {
    setData(null);
    setCountry(e.target.value);
  };

  // Line chart for Global Data
  // Line chart for Global Data
  const lineChart = (
    <Line
      data={{
        labels: dailyData.map((entry) => new Date(entry.dateChecked).toLocaleDateString()),
        datasets: [
          {
            label: "Infected",
            data: dailyData.map((entry) => entry.positive),
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.1)",
            borderWidth: 2,
            fill: true,
          },
          {
            label: "Deaths",
            data: dailyData.map((entry) => entry.death),
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            fill: true,
          },
          {
            label: "Recovered",
            data: dailyData.map((entry) => entry.recovered), // Add the recovered data
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.1)",
            borderWidth: 2,
            fill: true,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          x: {
            ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15 },
            grid: { color: "rgba(0,0,0,0.1)" },
          },
          y: {
            type: "logarithmic",
            ticks: {
              callback: function (value) {
                return Number(value).toLocaleString();
              },
            },
          },
        },
        plugins: {
          legend: { position: "top", labels: { usePointStyle: true, boxWidth: 20, padding: 20 } },
          title: { display: true, text: "Daily COVID-19 Cases: Infected, Deaths, and Recovered" },
        },
      }}
    />
  );


  const barChart = (
    <Bar
      data={{
        labels: dailyData.map((entry) => new Date(entry.dateChecked).toLocaleDateString()),
        datasets: [
          {
            label: "Infected",
            data: dailyData.map((entry) => entry.positive),
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.1)",
            borderWidth: 2,
          },
          {
            label: "Deaths",
            data: dailyData.map((entry) => entry.death),
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            borderWidth: 2,
          },
          {
            label: "Recovered",
            data: dailyData.map((entry) => entry.recovered), // Add the recovered data
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.1)",
            borderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15 },
            grid: { color: "rgba(0,0,0,0.1)" },
          },
          y: {
            ticks: {
              callback: function (value) {
                return Number(value).toLocaleString();
              },
            },
          },
        },
        plugins: {
          legend: { position: "top", labels: { usePointStyle: true, boxWidth: 20, padding: 20 } },
          title: { display: true, text: `Daily COVID-19 Cases: Infected, Deaths, and Recovered (${country})` },
        },
      }}
    />
  );


  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      {/* Country Selector */}
      <div className="flex flex-wrap items-center justify-center space-x-8">
        <div className="flex flex-col items-center transition-transform transform hover:scale-105 duration-500 ease-in-out animate__animated animate__fadeInLeft">
          <img
            src="corona2.jpg"
            alt="COVID-19"
            className="w-[200px] rounded-full  transition-transform duration-300 ease-in-out animate-rotate"
          />
        </div>
        <div className="flex flex-col items-center transition-all duration-500 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 p-6 rounded-lg shadow-lg animate__animated animate__fadeInRight">
          <div className="text-5xl mb-4">
            <h1 className="text-center font-bold text-gray-800 dark:text-white transform transition-transform duration-500 ease-in-out hover:scale-105 hover:text-red-500 animate__animated animate__fadeIn animate__delay-1s">
              COVID-19 APP
            </h1>
          </div>
          <select
            value={country}
            onChange={handleCountryChange}
            className="p-2 mt-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <option value="all">Global</option>
            {countries.map((country: any) => (
              <option key={country.countryInfo._id} value={country.countryInfo.iso2}>
                {country.country}
              </option>
            ))}
          </select>
        </div>
        <img
          src="corona2.jpg"
          alt="COVID-19"
          className="w-[200px] rounded-full  secondimg transition-transform duration-300 ease-in-out animate-rotate"
        />
      </div>




      {/* COVID-19 Stats */}
      <div className="flex justify-center flex-wrap gap-4">
        {data ? (
          <>
            <div className="">
              <a
                href="#"
                className="block max-w-sm p-6 bg-slate-400 border border-gray-200 rounded-lg shadow hover:bg-slate-500 text-white hover:text-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-300"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Infected
                </h5>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  <CountUp start={0} end={data.cases} duration={2.75} separator="," />
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Total cases of COVID-19
                </p>
                <span className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">
                  Last Updated: {new Date(data.updated).toLocaleDateString()}
                </span>
              </a>
            </div>
            <div>
              <a
                href="#"
                className="block max-w-sm p-6 bg-green-400 border border-gray-200 rounded-lg shadow hover:bg-green-500 text-white hover:text-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-green-600 dark:hover:text-white transition-colors duration-300"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Recovered
                </h5>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  <CountUp start={0} end={data.recovered} duration={2.75} separator="," />
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Number of recovered cases
                </p>
                <span className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">
                  Last Updated: {new Date(data.updated).toLocaleDateString()}
                </span>
              </a>
            </div>
            <div>
              <a
                href="#"
                className="block max-w-sm p-6 bg-red-600 border text-white border-gray-200 rounded-lg shadow hover:bg-red-700 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight   dark:text-white">
                  Deaths
                </h5>
                <h5 className="mb-2 text-2xl font-bold tracking-tight  dark:text-white">
                  <CountUp start={0} end={data.deaths} duration={2.75} separator="," />
                </h5>
                <p className="font-normal dark:text-gray-400">
                  Total deaths due to COVID-19
                </p>
                <span className="mb-2 font-bold tracking-tight  dark:text-white">
                  Last Updated: {new Date(data.updated).toLocaleDateString()}
                </span>
              </a>
            </div>
            {/* Similar for Recovered and Deaths */}
          </>
        ) :(
          <Spinner></Spinner>
        )}
      </div>

      {/* Chart */}
  <div className="w-full max-w-4xl mt-8 flex items-center justify-between">
  {/* <div>
    <button className="px-4 py-2 bg-gray-300 rounded-md">Previous</button>
  </div> */}
  
  <div className="flex justify-center w-full overflow-x-auto min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
    {country === "all" ? lineChart : barChart}
  </div>
  
  {/* <div>
    <button className="px-4 py-2 bg-gray-300 rounded-md">Next</button>
  </div> */}
</div>


    </div>
  );
}
