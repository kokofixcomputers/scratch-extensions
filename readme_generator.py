import os
import urllib.parse


# Set the directory you want to get the files from
directory = '/Users/ct/Git/scratch-extenstions/scratch-extensions'

# Get a list of all the files in the directory
files = os.listdir(directory)

# Open the file in write mode to empty it
with open('file_names.txt', 'w') as file:
    pass

# Write the file names to the text file
with open('file_names.txt', 'a') as file:
    for filename in files:
        filename_display = filename
        if ' ' in filename:
            # Replace spaces with URL encoding (%20)
            filename = urllib.parse.quote(filename)
        file.write(filename_display + ' [url](https://kokofixcomputers.github.io/scratch-extensions/' + filename + ')<br><br>\n')