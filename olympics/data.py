import pandas as pd
import numpy as np
import warnings
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib

# Silence Warnings
warnings.filterwarnings("ignore")


df = pd.read_csv('participants.csv', header=None)
df.columns = ["country", "athletes"]
# Strip whitespace from country names
df['country'] = df['country'].str.strip()

country_names_map = {
    "Brunei Darussalam": "Brunei",
    "Cabo Verde":"Cape Verde",
    "Chinese Taipei": "Taiwan",
    "Congo": "Republic of the Congo",
    "Czechia": "Czech Republic",
    "Cote d'Ivoire": "Ivory Coast",
    "Democratic People's Republic of Korea": "North Korea",
    "Democratic Republic of Timor-Leste": "East Timor",
    "Federated States of Micronesia": "Micronesia",
    "Great Britain": "United Kingdom",
    "Islamic Republic of Iran": "Iran",
    "Lao People's Democratic Republic": "Laos",
    "People's Republic of China": "China",
    "Republic of Korea": "South Korea",
    "Republic of Moldova": "Moldova",
    "Sao Tome and Principe": "São Tomé and Príncipe",
    "St Vincent and the Grenadines": "Saint Vincent and the Grenadines",
    "Syrian Arab Republic": "Syria",
    "United Republic of Tanzania": "Tanzania",
    "United States of America": "United States",
    "US Virgin Islands": "U.S. Virgin Islands",
}

# Replace country names with the correct ones
df['country'] = df['country'].replace(country_names_map)

url = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population"
tables = pd.read_html(url)
population = tables[0][["Location", "Population"]]

url = "https://en.wikipedia.org/wiki/2024_Summer_Olympics_medal_table"
tables = pd.read_html(url)
medals = tables[4]

population["Location"] = [t.split("(")[0].strip() for t in population["Location"]]

merged = df.merge(population, left_on="country", right_on="Location")

merged = merged.merge(medals, left_on="country", right_on="NOC", how="left")
merged.fillna(0, inplace=True)
merged.drop(columns=["Location", "NOC", "Rank"], inplace=True)

merged["athletes_per_million"] = merged["athletes"] / merged["Population"] * 1e6
merged["medals_per_athlete"] = merged["Total"] / merged["athletes"]

merged.to_csv("medals.csv", index=False)