import os
import argparse
from PIL import Image


def split_and_save_image(input_image_path, output_directory, rows, columns, skip_the_last):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    image = Image.open(input_image_path)
    width, height = image.size

    cell_width = width // columns
    cell_height = height // rows

    base_filename = os.path.splitext(os.path.basename(input_image_path))[0]

    total = (rows * columns) - skip_the_last
    count = 0
    for row in range(rows):
        for col in range(columns):
            if count >= total:
                break
            left = col * cell_width
            upper = row * cell_height
            right = left + cell_width
            lower = upper + cell_height

            cropped_image = image.crop((left, upper, right, lower))

            output_filename = f"{generateFileName(input_image_path,count)}.png"
            output_filepath = os.path.join(output_directory, output_filename)
            cropped_image.save(output_filepath)
            count += 1
            print(f"Guardado: {output_filepath}")


GENERATE_BASED_ON_INDEX = False
GENERATE_BASED_ON_RULE = True
RULE = [{"type": "literalList",
        "list": [],
         "lenght": 0},
        {"type": "expression",
        "template": "R[indexA][indexB]B",
         "indexA": {"startAt": 60, "move": 1, "max": 69, "moveIf": "loopIndex ==3", "min": 0},
         "indexB": {"startAt": 3, "move": -1, "moveIf": "True", "min": 0, "max": 3},
         "loopSize": 4}]


def generateFileName(base, index):
    try:
        if (GENERATE_BASED_ON_INDEX):
            return base + str(index)
        else:
            return base + nameList[index]

    except Exception as e:
        print(e)
        return "error" + base + str(index)


nameList = []


def composeNameList():
    iterations = 0
    nameList = []
    for rule in RULE:
        if (rule["type"] == "literalList"):
            for i in range(rule["lenght"]):
                nameList.append(rule["list"][i])
        if (rule["type"] == "expression"):
            template = rule["template"]
            indexA = rule["indexA"]
            iA = indexA["startAt"]
            indexB = rule["indexB"]
            iB = indexB["startAt"]
            # loop until each index is at max or min depending on move being positive or negative
            while (iA <= indexA["max"] and iA >= indexA["min"] and iB <= indexB["max"] and iB >= indexB["min"]):
                loopIndex = iterations % rule["loopSize"]
                if (eval(indexA["moveIf"])):
                    iA += indexA["move"]
                if (eval(indexB["moveIf"])):
                    iB += indexB["move"]
                iterations += 1
                nameList.append(template.replace(
                    "[indexA]", str(iA)).replace("[indexB]", str(iB)))
    print("nameList: ", nameList)



def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Divide una imagen en una cuadrícula y guarda cada parte como una imagen separada.")
    parser.add_argument("input_image_path",
                        help="Ruta de la imagen de entrada.")
    parser.add_argument(
        "rows", type=int, help="Número de filas en la cuadrícula.")
    parser.add_argument("columns", type=int,
                        help="Número de columnas en la cuadrícula.")
    parser.add_argument("skip", type=int,
                        help="skip this many cells in the end.", default=0)
    parser.add_argument("--output_directory", default="output",
                        help="Directorio para guardar las imágenes resultantes (predeterminado: ./output)")

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_arguments()

    input_image_path = args.input_image_path
    output_directory = args.output_directory
    rows = args.rows
    columns = args.columns
    skip_the_last = args.skip
    if (GENERATE_BASED_ON_RULE):
        composeNameList()
        print(nameList)

    split_and_save_image(input_image_path, output_directory,
                         rows, columns, skip_the_last)
