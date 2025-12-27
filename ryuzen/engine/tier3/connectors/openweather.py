"""OpenWeather connector for weather data."""

import logging
import os
from typing import List, Optional
import aiohttp

from ..base import Tier3Connector, KnowledgeSnippet, SourceCategory

logger = logging.getLogger(__name__)


class OpenWeatherConnector(Tier3Connector):
    """
    OpenWeather API connector for meteorological data.

    API docs: https://openweathermap.org/api
    Requires API key from https://openweathermap.org/api
    """

    API_BASE = "https://api.openweathermap.org/data/2.5"
    GEO_API = "https://api.openweathermap.org/geo/1.0/direct"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            source_name="OpenWeather-API",
            reliability=0.88,
            category=SourceCategory.SCIENCE,
            enabled=True,
            requires_api_key=True
        )
        self.api_key = api_key or os.environ.get("OPENWEATHER_API_KEY")
        self._session = None

        if not self.api_key:
            logger.warning("OpenWeather: Missing API key, connector will return empty results")

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def fetch(self, query: str, max_results: int = 3) -> List[KnowledgeSnippet]:
        if not self.api_key:
            logger.debug("OpenWeather: No API key configured")
            return []

        try:
            session = await self._get_session()
            snippets = []

            # First, geocode the location query
            geo_params = {
                "q": query,
                "limit": max_results,
                "appid": self.api_key
            }

            async with session.get(self.GEO_API, params=geo_params) as response:
                if response.status != 200:
                    logger.warning(f"OpenWeather Geo: {response.status}")
                    self._record_error()
                    return []

                locations = await response.json()

            if not locations:
                # Query might be about weather in general, not a location
                # Return general weather info
                self._record_success()
                return []

            # Get weather for each location
            for location in locations[:max_results]:
                lat = location.get("lat")
                lon = location.get("lon")
                name = location.get("name", "")
                country = location.get("country", "")
                state = location.get("state", "")

                if lat is None or lon is None:
                    continue

                # Get current weather
                weather_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric"
                }

                async with session.get(
                    f"{self.API_BASE}/weather",
                    params=weather_params
                ) as response:
                    if response.status != 200:
                        continue

                    weather_data = await response.json()

                # Extract weather info
                main = weather_data.get("main", {})
                weather = weather_data.get("weather", [{}])[0]
                wind = weather_data.get("wind", {})
                clouds = weather_data.get("clouds", {})
                sys = weather_data.get("sys", {})

                temp = main.get("temp", "")
                feels_like = main.get("feels_like", "")
                humidity = main.get("humidity", "")
                pressure = main.get("pressure", "")
                description = weather.get("description", "")
                wind_speed = wind.get("speed", "")
                cloudiness = clouds.get("all", "")
                sunrise = sys.get("sunrise", "")
                sunset = sys.get("sunset", "")

                # Format location
                location_str = name
                if state:
                    location_str += f", {state}"
                if country:
                    location_str += f", {country}"

                # Build content
                content_parts = [f"Weather: {location_str}"]
                if description:
                    content_parts.append(f"Conditions: {description.title()}")
                if temp != "":
                    content_parts.append(f"Temperature: {temp}°C (feels like {feels_like}°C)")
                if humidity != "":
                    content_parts.append(f"Humidity: {humidity}%")
                if wind_speed != "":
                    content_parts.append(f"Wind: {wind_speed} m/s")
                if cloudiness != "":
                    content_parts.append(f"Cloud Cover: {cloudiness}%")
                if pressure != "":
                    content_parts.append(f"Pressure: {pressure} hPa")

                content = "\n".join(content_parts)

                url = f"https://openweathermap.org/city/{weather_data.get('id', '')}"

                snippet = KnowledgeSnippet(
                    source_name=self.source_name,
                    content=content[:1500],
                    reliability=self.reliability,
                    category=self.category,
                    url=url,
                    metadata={
                        "location": location_str,
                        "lat": lat,
                        "lon": lon,
                        "temperature": temp,
                        "conditions": description,
                        "type": "weather_current"
                    }
                )
                snippets.append(snippet)

            self._record_success()
            return snippets

        except Exception as e:
            logger.error(f"OpenWeather error: {e}")
            self._record_error()
            return []

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
