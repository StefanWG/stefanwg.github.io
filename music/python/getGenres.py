
gSet = set()
with open("genres.csv", "w") as genres:
    with open("artists2.csv", "r") as file:
        for line in file.readlines():
            f = line.strip().split(",")[-1].split("&")
            for g in f:
                if g in gSet:
                    continue
                gSet.add(g)
                genres.write(g)
                genres.write("\n")

