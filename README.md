# infer-cnv-visualization

Visualization is heavily influenced by https://github.com/ColinEberhardt/d3fc-webgl-hathi-explorer

To produce the visualization there are two main steps:

1. Data preparation
2. Serving the website

## Data Preparation

There are three files you need.

The first file is `infercnv.heatmap_thresholds.txt` which is found inside of your infercnv output

The second and third files are `spot.tsv` and `output_compressed.tsv`. These files are produced by the data_prep directory.

The conda environment is located at: `/diskmnt/Projects/Users/efang/miniconda3/envs/FindNormal2`

Once the environment is built, run `conda activate FindNormal2`

cd into the data_prep directory and run:
`python main.py {spaceranger_output_dir} {annotation_file} {infercnv.observations.txt_file_located_in_infercnv_output} {gene_order_file}`

An example of this run is:
`python main.py /diskmnt/Datasets/Spatial_Transcriptomics/outputs_OCT/Human/HT206B1/H1/HT206B1-U1_ST_Bn1/outs /diskmnt/Projects/Users/efang/normalized_annotations2/HT206B1-U1_ST_Bn1-with_normal_annotations.csv /diskmnt/Projects/Users/efang/SpatialInferCNV/InferCNVRunsOutput2/InferCNVrun_outputs-HT206B1-U1_ST_Bn1/infercnv.observations.txt /diskmnt/Projects/Users/efang/SpatialInferCNV/siCNV_GeneOrderFile.tsv`

This will output both `spot.tsv` and `output_compressed.tsv` in the same directory (as well as some byproduct files)

Move all three files into the same directory that you will serve the website with.

## Serving the website

The easiest way to serve the website is using VSCode.

You can also serve the website through Python flask if you want.

Todo:

- Create a legend for the tumor annotations
- Modify the pointer for the bottom image so that it can also create annotations to the top
