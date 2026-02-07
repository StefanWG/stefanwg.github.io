import pandas as pd
import numpy as np
import warnings
import matplotlib.pyplot as plt
import seaborn as sns # type: ignore
import matplotlib

import time

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
    "France*":"France"
}

# Replace country names with the correct ones
df['country'] = df['country'].replace(country_names_map)


# Get Medals Data
url = "https://en.wikipedia.org/wiki/2024_Summer_Olympics_medal_table"
tables = pd.read_html(url)
medals = tables[4]
medals['NOC'] = medals['NOC'].replace(country_names_map)
medals.loc[medals['NOC'] == "France*", "NOC"]  = "France"

merged = df.merge(medals, left_on="country", right_on="NOC", how="left")
merged.fillna(0, inplace=True)
merged.drop(columns=["NOC", "Rank"], inplace=True)

merged.to_csv("medals.csv", index=False)



# Create Plots
vals = np.concatenate([np.arange(1, 1.5, 0.01), np.arange(1.5, 10, 0.1), np.array([10, 15, 20, 25, 30, 40, 50, 60, 75, 100])]) 
d = merged.loc[merged["Total"]>0]

country_arrays = {k:np.zeros((len(vals),len(vals))) for k in d["country"]}

pd.DataFrame([c for c in country_arrays.keys()]).to_csv("data/countries.csv", index=False, header=None)

for x in range(0, len(vals)):
    for y in range(0,len(vals)):
        bronze = 1 
        silver = bronze * vals[x]
        gold = silver * vals[y]
        d = merged.loc[merged["Total"]>0]
        d["points"] = d["Bronze"] * bronze + d["Silver"] * silver + d["Gold"] * gold
        d["rank"] = d["points"].rank(method="min", ascending=False)
        for i, row in d.iterrows():
            country_arrays[row["country"]][y-1, x-1] = row["rank"]

for country in country_arrays.keys():
    arr = country_arrays[country][:-1].T[:-1].T
    ax = sns.heatmap(arr, annot=False, fmt=".0f", cmap="viridis", cbar=False,
        norm=matplotlib.colors.LogNorm( vmin=1, vmax=len(country_arrays)-20))
    ax.invert_yaxis()
    plt.tick_params(top=False, labeltop=False, bottom=False, labelbottom=False, left=False, labelleft=False)
    plt.savefig(f"plots/{country}.png", bbox_inches='tight', pad_inches=0)
    plt.close()
