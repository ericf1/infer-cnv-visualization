from matrix_to_csv import convert_space_separated_to_csv
from validate import validate
from spot_generate import spot_generate
import sys


def main():
    # spaceranger_path = "/diskmnt/Datasets/Spatial_Transcriptomics/outputs_OCT/Human/HT206B1/H1/HT206B1-U1_ST_Bn1/outs"
    # annotation_path = "/diskmnt/Projects/Users/efang/normalized_annotations/HT206B1-U1_ST_Bn1-with_normal_annotations.csv"
    # input_filename = "/Users/human/infercnv_visualization/data/infercnv.observations.txt"
    # gene_order_file = "/Users/human/infercnv_visualization/data/siCNV_GeneOrderFile.tsv"

    spaceranger_path = sys.argv[1]
    annotation_path = sys.argv[2]
    input_filename = sys.argv[3]
    gene_order_file = sys.argv[4]

    # python main.py /diskmnt/Datasets/Spatial_Transcriptomics/outputs_OCT/Human/HT206B1/H1/HT206B1-U1_ST_Bn1/outs /diskmnt/Projects/Users/efang/normalized_annotations2/HT206B1-U1_ST_Bn1-with_normal_annotations.csv /diskmnt/Projects/Users/efang/SpatialInferCNV/InferCNVRunsOutput2/InferCNVrun_outputs-HT206B1-U1_ST_Bn1/infercnv.observations.txt /diskmnt/Projects/Users/efang/SpatialInferCNV/siCNV_GeneOrderFile.tsv

    print("script starting")
    spot_generate(spaceranger_path, annotation_path)
    print("spot generated")
    convert_space_separated_to_csv(input_filename)
    print("csv generated")
    validate(gene_order_file)
    print("script complete")


if __name__ == "__main__":
    main()
