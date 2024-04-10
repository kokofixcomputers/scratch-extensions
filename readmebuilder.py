import os
import requests

# Function to download a file from a URL
def download_file(url, filename):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            # Get the current directory
            current_directory = os.path.dirname(os.path.realpath(__file__))
            # Create the full path for saving the file
            full_path = os.path.join(current_directory, filename)
            with open(full_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=1024):
                    file.write(chunk)
            print(f"File '{filename}' downloaded successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {e}")

# Function to append file information to a Markdown file
def append_to_markdown(filename, markdown_file):
    try:
        # Get the current directory
        current_directory = os.path.dirname(os.path.realpath(__file__))
        # Create the full path for the Markdown file
        full_path = os.path.join(current_directory, markdown_file)
        
        with open(full_path, 'a') as file:
            file.write(f"{filename} [{os.path.splitext(filename)[0]}](https://kokofixcomputers.github.io/scratch-extensions/{os.path.splitext(filename)[0]}.js)<br><br>\n")
            file.close()
    except IOError as e:
        print(f"Error appending to Markdown file: {e}")

# Main function
def main():
    url = input("Enter the URL of the file to download: ")
    filename = os.path.basename(url)
    download_file(url, filename)
    append_to_markdown(filename, 'readme.md')

if __name__ == "__main__":
    main()