import os
from PIL import Image
import pytesseract
from googletrans import Translator

#translate using openia api model gpt 3.5 turbo



def extract_text(image_path):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text

from googletrans import Translator

def translate_text(text, target_language='es'):
    translator = Translator(service_urls=['translate.google.com'])
    translated_text = translator.translate(text, dest=target_language).text
    return translated_text

def process_images(input_directory, output_directory, target_language='es'):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    for filename in os.listdir(input_directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            input_filepath = os.path.join(input_directory, filename)
            print(f"Procesando: {input_filepath}")

            # Extraer texto usando OCR
            extracted_text = extract_text(input_filepath)

            print(f"Texto extraído: {extracted_text}")

            if(len(extracted_text) == 0):
                print("No se pudo extraer texto de la imagen. Saltando...")
                continue

            # Traducir texto
            translated_text = extracted_text #= translate_text(extracted_text, target_language)

            # Guardar texto traducido en un archivo
            output_filepath = os.path.join(output_directory, f"{input_directory}.txt")
            #append text to file
            with open(output_filepath, 'a') as output_file:
                #first add a header with the filename
                output_file.write(f"Name: {filename},\n text: ")
                output_file.write(translated_text)
                output_file.write("\n")


            print(f"Texto traducido guardado en: {output_filepath}")

if __name__ == "__main__":
    input_directory = 'splitted_images'
    output_directory = 'translated_text'
    target_language = 'es'  # Cambia esto al código de idioma de destino que desees

    process_images(input_directory, output_directory, target_language)
