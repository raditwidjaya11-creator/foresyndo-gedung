import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Sun, 
  Wind, 
  Thermometer, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface WeatherData {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
}

interface HourlyForecast {
  timeLabel: string;
  temp: number;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Jatitujuh, Majalengka Coordinates
  const LATITUDE = -6.6344;
  const LONGITUDE = 108.2144;

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&hourly=temperature_2m&timezone=Asia/Jakarta`
      );
      if (!response.ok) throw new Error('Weather API failed');
      
      const data = await response.json();
      if (data && data.current_weather) {
        setWeather({
          temperature: data.current_weather.temperature,
          windspeed: data.current_weather.windspeed,
          winddirection: data.current_weather.winddirection,
          weathercode: data.current_weather.weathercode,
          time: data.current_weather.time,
        });

        if (data.hourly && data.hourly.time && data.hourly.temperature_2m) {
          // Extract the first 24 hours corresponding to the current day
          const times = data.hourly.time.slice(0, 24);
          const temps = data.hourly.temperature_2m.slice(0, 24);
          const formatted: HourlyForecast[] = times.map((t: string, idx: number) => {
            const hourStr = t.split('T')[1] || '';
            const cleanHour = hourStr.substring(0, 5); // "14:00"
            return {
              timeLabel: cleanHour,
              temp: temps[idx]
            };
          });
          setHourlyData(formatted);
        }

        setLastRefreshed(new Date());
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError(true);
      // Fallback data for Jatitujuh (typical dry-season tropical weather)
      if (!weather) {
        setWeather({
          temperature: 31.2,
          windspeed: 8.5,
          winddirection: 110,
          weathercode: 2, // Partly cloudy
          time: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to interpret weather code and return description, icon and construction advisories
  const getWeatherDetails = (code: number) => {
    switch (code) {
      case 0:
        return {
          desc: 'Cerah Berawan',
          icon: <Sun className="w-4 h-4 text-amber-400" />,
          isOptimal: true,
          statusColor: 'text-emerald-400',
          advice: 'Sangat baik untuk pengecoran beton f\'30, pengelasan struktur baja poolside, cat kamprot dinding fasad luar, dan instalasi mekanikal pompa Hayward.',
          alertLevel: 'clear'
        };
      case 1:
      case 2:
        return {
          desc: 'Cerah Berawan',
          icon: <CloudSun className="w-4 h-4 text-amber-300" />,
          isOptimal: true,
          statusColor: 'text-emerald-400',
          advice: 'Kondisi cuaca cerah optimal. Lanjutkan pengelasan, plesteran luar ruangan, perakitan WPC cafe poolside, dan lanskap kamboja Bali.',
          alertLevel: 'clear'
        };
      case 3:
        return {
          desc: 'Berawan Tebal',
          icon: <Cloud className="w-4 h-4 text-slate-300" />,
          isOptimal: true,
          statusColor: 'text-yellow-400',
          advice: 'Cuaca teduh aman untuk pengerjaan luar ruangan. Pantau awan mendung sebelum memulai tahapan finishing sensitif seperti cat kamprot eksterior.',
          alertLevel: 'warning'
        };
      case 45:
      case 48:
        return {
          desc: 'Berkabut',
          icon: <CloudFog className="w-4 h-4 text-slate-400" />,
          isOptimal: false,
          statusColor: 'text-yellow-400',
          advice: 'Jarak pandang berkurang. Nyalakan penerangan area kerja, hati-hati pada pengoperasian scaffolding dan crane di lantai mezanin atas.',
          alertLevel: 'warning'
        };
      case 51:
      case 53:
      case 55:
        return {
          desc: 'Gerimis Berair',
          icon: <CloudDrizzle className="w-4 h-4 text-blue-300" />,
          isOptimal: false,
          statusColor: 'text-orange-400',
          advice: 'Tutup area curing semen segar dengan terpal plastik. Hindari pengelasan luar di dek poolside cafe tanpa naungan canopy membran.',
          alertLevel: 'warning'
        };
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return {
          desc: 'Hujan Deras',
          icon: <CloudRain className="w-4 h-4 text-blue-400" />,
          isOptimal: false,
          statusColor: 'text-red-400',
          advice: 'STOP pengerjaan beton luar ruang & cat kamprot! Amankan kelistrikan pompa kolam dan pastikan sand filter terproteksi terpal aman.',
          alertLevel: 'danger'
        };
      case 95:
      case 96:
      case 99:
        return {
          desc: 'Hujan Petir',
          icon: <CloudLightning className="w-4 h-4 text-purple-400" />,
          isOptimal: false,
          statusColor: 'text-red-500 font-bold',
          advice: 'BAHAYA PETIR & ARUS BOCOR! Hentikan aktivitas crane, scaffold tinggi, dan semua pengelasan baja luar ruang. ELCB cafe container harus dipastikan aktif!',
          alertLevel: 'danger'
        };
      default:
        return {
          desc: 'Tropis Hangat',
          icon: <CloudSun className="w-4 h-4 text-amber-300" />,
          isOptimal: true,
          statusColor: 'text-emerald-400',
          advice: 'Cuaca standard Jatitujuh. Pantau berkala sirkulasi angin kencang Kertajati sebelum menaruh scaffolding tinggi.',
          alertLevel: 'clear'
        };
    }
  };

  const info = weather ? getWeatherDetails(weather.weathercode) : getWeatherDetails(2);

  // Translate wind direction in degrees to compass direction
  const getWindDirection = (deg: number) => {
    const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  // Sparkline data preparation with default values as fallback
  const chartData = hourlyData.length > 0 ? hourlyData : [
    { timeLabel: '00:00', temp: 25.5 },
    { timeLabel: '02:00', temp: 24.8 },
    { timeLabel: '04:00', temp: 24.2 },
    { timeLabel: '06:00', temp: 25.0 },
    { timeLabel: '08:00', temp: 28.5 },
    { timeLabel: '10:00', temp: 31.0 },
    { timeLabel: '12:00', temp: 33.5 },
    { timeLabel: '14:00', temp: 34.0 },
    { timeLabel: '16:00', temp: 31.5 },
    { timeLabel: '18:00', temp: 28.0 },
    { timeLabel: '20:00', temp: 26.8 },
    { timeLabel: '22:00', temp: 26.0 },
  ];

  const tempsArray = chartData.map(d => d.temp);
  const minTemp = Math.min(...tempsArray).toFixed(1);
  const maxTemp = Math.max(...tempsArray).toFixed(1);

  // Custom tooltips for Recharts
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-1.5 rounded text-[9px] font-mono shadow-xl text-slate-100">
          <p className="font-bold">{payload[0].payload.timeLabel} WIB</p>
          <p className="text-orange-400 font-extrabold">{payload[0].value.toFixed(1)}°C</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative inline-block" id="weather-widget-container">
      {/* Mini Widget in the Header */}
      <button
        type="button"
        onClick={() => setIsTooltipOpen(!isTooltipOpen)}
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 rounded-lg text-[10px] font-mono text-blue-100 transition duration-150 cursor-pointer select-none"
      >
        <div className="flex items-center gap-1 border-r border-blue-500/20 pr-2">
          {info.icon}
          <span className="font-bold">{weather?.temperature.toFixed(1)}°C</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-orange-400 uppercase tracking-wide">Jatitujuh:</span>
          <span className="text-slate-300 truncate max-w-[80px]">{info.desc}</span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ${isTooltipOpen ? 'rotate-180' : ''}`} />

        {loading && (
          <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin ml-0.5" />
        )}
      </button>

      {/* Floating Construction advisory panel */}
      {isTooltipOpen && weather && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4 font-mono animate-fade-in text-slate-100 pointer-events-auto select-text">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">MONITOR CUACA JATITUJUH</h4>
              <p className="text-[9px] text-slate-400">Kawasan PT. FGI - Kost Kertajati</p>
            </div>
            {error && (
              <span className="text-[8px] px-1.5 py-0.5 bg-red-950 text-red-400 font-bold border border-red-900/50 rounded">OFFLINE</span>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[8px] text-slate-500 block uppercase font-bold">Temperatur</span>
                <span className="text-[11px] text-slate-200 font-black">{weather.temperature.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[8px] text-slate-500 block uppercase font-bold">Kecepatan Angin</span>
                <span className="text-[11px] text-slate-200 font-black">{weather.windspeed} km/h {getWindDirection(weather.winddirection)}</span>
              </div>
            </div>
          </div>

          {/* Sparkline Temperature Chart */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 mb-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider">Fluktuasi Suhu Hari Ini</span>
              <span className="text-[8px] text-orange-400 font-bold">Min: {minTemp}°C | Max: {maxTemp}°C</span>
            </div>
            <div className="h-14 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timeLabel" hide />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <Tooltip content={renderCustomTooltip} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f97316" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[7px] text-slate-500 font-bold mt-1 uppercase">
              <span>00:00 WIB</span>
              <span>12:00 WIB</span>
              <span>23:00 WIB</span>
            </div>
          </div>

          {/* Construction Advisor Status */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {info.isOptimal ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              )}
              <span className="text-[9px] font-bold text-slate-300 uppercase">Rekomendasi Konstruksi:</span>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-200 font-sans font-medium">
              {info.advice}
            </p>

            {info.isOptimal ? (
              <div className="text-[8.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-center mt-1">
                ✔ AMAN UNTUK SEMUA AKTIVITAS DED
              </div>
            ) : (
              <div className="text-[8.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-orange-500/10 border border-orange-500/25 text-orange-400 text-center mt-1">
                ⚠ TINDAK LANJUTI PROSEDUR CURAH HUJAN
              </div>
            )}
          </div>

          {/* Footer refresh info */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-500">
            <span>Segar: {lastRefreshed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                fetchWeather();
              }}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SINKRON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
