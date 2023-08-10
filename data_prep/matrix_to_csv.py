import csv


def convert_space_separated_to_csv(input_file):
    with open(input_file, 'r') as infile:
        # Read the space-separated file
        lines = infile.readlines()

    # Parse the data and split by spaces
    data = [line.strip().split() for line in lines]

    with open("./output.csv", 'w', newline='') as outfile:
        # Write data to the CSV file
        csv_writer = csv.writer(outfile)
        csv_writer.writerows(data)

    # print(f"Conversion completed. CSV file saved as "./output.csv)


if __name__ == "__main__":
    # Replace with your input file name
    input_filename = "/Users/human/infercnv_visualization/data/infercnv.observations.txt"
    # Replace with your desired output file name
    output_filename = "/Users/human/infercnv_visualization/data/output.csv"

    convert_space_separated_to_csv(input_filename)
