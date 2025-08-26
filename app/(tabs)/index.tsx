  import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

  const { width, height } = Dimensions.get("window");

  // 🌦️ Weather Effects
  function RainEffect() {
    const drops = Array.from({ length: 25 });
    return (
      <View style={StyleSheet.absoluteFillObject}>
        {drops.map((_, i) => (
          <Drop key={i} />
        ))}
      </View>
    );
  }
  function Drop() {
    const translateY = useRef(new Animated.Value(-50)).current;
    const translateX = Math.random() * width;
    useEffect(() => {
      Animated.loop(
        Animated.timing(translateY, {
          toValue: height,
          duration: 2000 + Math.random() * 2000,
          useNativeDriver: true,
        })
      ).start();
    }, []);
    return (
      <Animated.View
        style={{
          width: 2,
          height: 12,
          backgroundColor: "rgba(255,255,255,0.6)",
          position: "absolute",
          transform: [{ translateY }, { translateX }],
        }}
      />
    );
  }

  function CloudEffect() {
    const clouds = Array.from({ length: 3 });
    return (
      <View style={StyleSheet.absoluteFillObject}>
        {clouds.map((_, i) => (
          <Cloud key={i} delay={i * 2000} />
        ))}
      </View>
    );
  }
  function Cloud({ delay }: { delay: number }) {
    const translateX = useRef(new Animated.Value(-200)).current;
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: width,
            duration: 20000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -200,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);
    return (
      <Animated.View
        style={{
          width: 150,
          height: 80,
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: 50,
          position: "absolute",
          top: 100 + Math.random() * 150,
          transform: [{ translateX }],
        }}
      />
    );
  }

  function SnowEffect() {
    const flakes = Array.from({ length: 20 });
    return (
      <View style={StyleSheet.absoluteFillObject}>
        {flakes.map((_, i) => (
          <Snowflake key={i} />
        ))}
      </View>
    );
  }
  function Snowflake() {
    const translateY = useRef(new Animated.Value(-10)).current;
    const translateX = Math.random() * width;
    useEffect(() => {
      Animated.loop(
        Animated.timing(translateY, {
          toValue: height,
          duration: 5000 + Math.random() * 2000,
          useNativeDriver: true,
        })
      ).start();
    }, []);
    return (
      <Animated.Text
        style={{
          position: "absolute",
          fontSize: 20,
          color: "white",
          transform: [{ translateY }, { translateX }],
        }}
      >
        ❄️
      </Animated.Text>
    );
  }

  function SunEffect() {
    return (
      <View
        style={{
          position: "absolute",
          top: 80,
          left: width / 2 - 50,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "rgba(255, 223, 0, 0.8)",
          shadowColor: "yellow",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 50,
        }}
      />
    );
  }

  function HeatwaveEffect() {
    const scale = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);
    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          backgroundColor: "rgba(255, 140, 0, 0.1)",
          transform: [{ scale }],
        }}
      />
    );
  }

  // 🎭 Captions
  type WeatherKey = "cold" | "hot" | "rain" | "cloud" | "default";

  const normalCaptions: Record<WeatherKey, string[]> = {
    cold: ["Lamig grabe, cuddle mode 🥶❤️", "Hot choco tayo? ☕❄️"],
    hot: ["Init sobra, halo-halo vibes 🍧☀️", "Aircon pls 🥵❄️"],
    rain: ["Ulan vibes, kape at Netflix ☕🎬", "Payong time ☔🌧️"],
    cloud: ["Maulap ☁️", "Labo ng langit, pero chill 😌"],
    default: ["Clear skies, roadtrip tayo 🚗💨", "Good vibes lang 🌞✨"],
  };

  const sadboyCaptions: Record<WeatherKey, string[]> = {
    cold: ["Ang lamig… tas masaya ka don. 🥶💔", "Need jacket, yakap mo nalang kaya?"],
    hot: ["Sandale mainet.", "Inet, panuntok kami nyang bff mo"],
    rain: ["Sorry, nabasa ng loha q", "Kala ko ulan, loha q lang pala."],
    cloud: ["Maulap, balik kana pls ☁️💔", "Ang labo… parang tayo."],
    default: ["Masaya kana sa iba, aw.", "Bomba na  "],
  };

  function randomLine(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 🌤 Main App
  export default function HomeScreen() {
    const [weather, setWeather] = useState<any>(null);
    const [caption, setCaption] = useState("");
    const [sadboyMode, setSadboyMode] = useState(false);
    const [condition, setCondition] = useState("default");
    const [selectedCity, setSelectedCity] = useState("Manila,PH");
    const [cityName, setCityName] = useState("Manila");

    const viewShotRef = useRef<any>(null);

    const onShare = async () => {
      try {
        const uri = await viewShotRef.current.capture();
        await Sharing.shareAsync(uri);
      } catch (e) {
        console.log("Share error:", e);
      }
    };

    useEffect(() => {
      (async () => {
        try {
          let url = "";
          if (selectedCity === "current") {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission denied", "Enable location for current weather.");
              return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=214ac42e343578806e2d1e782c354bd5&units=metric`;
          } else {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=214ac42e343578806e2d1e782c354bd5&units=metric`;
          }

          const res = await fetch(url);
          const data = await res.json();
          if (data.cod !== 200) throw new Error("API error");
          setWeather(data);
          setCondition(data.weather[0].main.toLowerCase());
          setCityName(data.name);
        } catch (err) {
          console.log("API ERROR:", err);
          setWeather({ main: { temp: 22 }, weather: [{ main: "Clouds" }] });
          setCondition("cloud");
          setCityName("Unknown");
        }
      })();
    }, [selectedCity]);

    useEffect(() => {
      if (!weather) return;
      const temp = weather.main.temp;
      let key: WeatherKey = "default";
      if (condition.includes("rain")) key = "rain";
      else if (condition.includes("cloud")) key = "cloud";
      else if (temp < 20) key = "cold";
      else if (temp > 30) key = "hot";

      setCaption(
        sadboyMode
          ? randomLine(sadboyCaptions[key])
          : randomLine(normalCaptions[key])
      );
    }, [weather, sadboyMode, condition]);

    const gradientColors: [string, string] = sadboyMode
      ? ["#434343", "#000000"]
      : condition.includes("rain")
      ? ["#4e54c8", "#8f94fb"]
      : condition.includes("cloud")
      ? ["#bdc3c7", "#2c3e50"]
      : condition.includes("clear")
      ? ["#56ccf2", "#2f80ed"]
      : weather?.main.temp < 20
      ? ["#83a4d4", "#b6fbff"]
      : weather?.main.temp > 30
      ? ["#f7971e", "#ffd200"]
      : ["#36d1dc", "#5b86e5"];

    return (
      <View style={{ flex: 1 }}>
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />

        {/* Weather effects */}
        {condition.includes("rain") && <RainEffect />}
        {condition.includes("cloud") && <CloudEffect />}
        {condition.includes("clear") && <SunEffect />}
        {weather?.main.temp < 20 && <SnowEffect />}
        {weather?.main.temp > 30 && <HeatwaveEffect />}

        {/* Content to Capture */}
        <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
          <View style={styles.content}>
            {weather && (
              <>
                <Text style={[styles.city, sadboyMode && styles.sadboyText]}>
                  {cityName}
                </Text>
                <Text style={[styles.temp, sadboyMode && styles.sadboyText]}>
                  {Math.round(weather.main.temp)}°C
                </Text>
                <Text style={[styles.caption, sadboyMode && styles.sadboyText]}>
                  {caption}
                </Text>
              </>
            )}
          </View>
        </ViewShot>

        {/* Controls */}
        <View style={{ alignItems: "center", paddingBottom: 40 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: "white", marginRight: 10 }}>10pm mode</Text>
            <Switch value={sadboyMode} onValueChange={setSadboyMode} />
          </View>

          <View
            style={{
              marginTop: 20,
              borderBottomWidth: 1,
              borderColor: "white",
              width: 220,
            }}
          >
            <Picker
              selectedValue={selectedCity}
              dropdownIconColor="white"
              onValueChange={(value: string) => setSelectedCity(value)}
              style={{ color: "white" }}
            >
              <Picker.Item label="My Location" value="current" />
              <Picker.Item label="Manila" value="Manila,PH" />
              <Picker.Item label="Batangas" value="Batangas,PH" />
              <Picker.Item label="Cebu" value="Cebu City,PH" />
              <Picker.Item label="Baguio" value="Baguio,PH" />
              <Picker.Item label="Davao" value="Davao City,PH" />
              <Picker.Item label="Palawan" value="Puerto Princesa,PH" />
              <Picker.Item label="Iloilo" value="Iloilo City,PH" />
            </Picker>
          </View>

          {/* Share Button */}
          <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
            <Text style={{ color: "white", fontSize: 16 }}>Share to Story</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    city: {
      fontSize: 28,
      color: "white",
      fontWeight: "600",
      marginBottom: 5,
    },
    temp: {
      fontSize: 48,
      color: "white",
      fontWeight: "bold",
    },
    caption: {
      fontSize: 20,
      color: "white",
      marginTop: 10,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    sadboyText: {
      fontStyle: "italic",
      opacity: 0.8,
    },
    shareBtn: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: "white",
      borderRadius: 20,
    },
  });
