import os
import json
import re
import requests
import mimetypes

def sanitize_folder_name(folder_name):
    folder_name = re.sub(r'[\\/*?:"<>|]', '_', folder_name)
    return folder_name.replace(' ', '_')

def download_file(url, destination_folder, counter):
    local_filename = None
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            content_type = r.headers.get('content-type')
            extension = mimetypes.guess_extension(content_type)
            
            file_name = url.split('/')[-1]
            if not file_name or '?' in file_name:
                file_name = f"unknown_file_{counter}{extension if extension else ''}"
            
            local_filename = os.path.join(destination_folder, file_name)
            print(f"Descargando {url} a {local_filename}")
            
            os.makedirs(destination_folder, exist_ok=True)
            
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
    except requests.exceptions.RequestException as e:
        print(f"Error al descargar {url}: {e}")
    return local_filename

def extract_all_urls(json_object):
    urls = []
    if isinstance(json_object, dict):
        for key, value in json_object.items():
            if isinstance(value, str) and value.startswith("http"):
                urls.append(value)
            elif isinstance(value, (dict, list)):
                urls.extend(extract_all_urls(value))
    elif isinstance(json_object, list):
        for item in json_object:
            urls.extend(extract_all_urls(item))
    return urls

def main():
    print("Bienvenido al script de análisis de mods de Tabletop Simulator.")
    print("Este script escaneará la carpeta del workshop de TTS, leerá los archivos JSON y mostrará una lista de mods disponibles.\n")

    workshop_path = input("Por favor, ingresa la ruta completa de la carpeta del workshop de TTS: ")
    workshop_path = workshop_path.replace('\\\\', os.sep)

    if not os.path.exists(workshop_path):
        print("La ruta proporcionada no existe. Por favor, verifica y vuelve a intentarlo.")
        return

    json_files = [f for f in os.listdir(workshop_path) if f.endswith('.json')]

    if not json_files:
        print("No se encontraron archivos JSON en la carpeta proporcionada.")
        return

    print("\nMods disponibles:")
    for idx, json_file in enumerate(json_files, 1):
        with open(os.path.join(workshop_path, json_file), 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if isinstance(data, dict):
                    mod_name = data.get('SaveName', 'Desconocido')
                    print(f"{idx}. {mod_name}")
                else:
                    print(f"{idx}. Contenido no reconocido en {json_file}")
            except json.JSONDecodeError:
                print(f"{idx}. No se pudo leer el archivo {json_file}")

    choice = input("\nIngresa el número del mod que deseas procesar o 'x' para salir: ")

    if choice.lower() == 'x':
        print("Saliendo del programa.")
        return

    try:
        selected_idx = int(choice) - 1
        selected_file = json_files[selected_idx]
    except (ValueError, IndexError):
        print("Selección no válida. Saliendo del programa.")
        return

    with open(os.path.join(workshop_path, selected_file), 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            mod_name = data.get('SaveName', 'Desconocido')
            sanitized_folder_name = sanitize_folder_name(mod_name)
            local_folder = os.path.join(".", sanitized_folder_name)
            print(f"Creando carpeta: {local_folder}")
            os.makedirs(local_folder, exist_ok=True)

            resource_urls = extract_all_urls(data)

            counter = 1
            for url in resource_urls:
                if url:
                    download_file(url, local_folder, counter)
                    counter += 1

            print(f"Archivos de recursos para el mod '{mod_name}' han sido descargados en la carpeta {local_folder}.")
        except json.JSONDecodeError:
            print("No se pudo leer el archivo seleccionado.")

if __name__ == "__main__":
    main()
