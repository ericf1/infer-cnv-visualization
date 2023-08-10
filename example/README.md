### Gathering the file paths

In this example, we will build the visualization for sample HT206B1-U1_ST_Bn1

We know from our (spreadsheet)[https://docs.google.com/spreadsheets/d/1SFGbtpTWeh7HbpRy9-y-WQ1XzZLcFTol01BPdMngBhs/edit#gid=0]

Spaceranger path is:
`/diskmnt/Datasets/Spatial_Transcriptomics/outputs_OCT/Human/HT206B1/H1/HT206B1-U1_ST_Bn1/outs`

We want to use these annotations:
`/diskmnt/Projects/Users/efang/normalized_annotations2/HT206B1-U1_ST_Bn1-with_normal_annotations.csv`

The output is located at:
`/diskmnt/Projects/Users/efang/SpatialInferCNV/InferCNVRunsOutput2/InferCNVrun_outputs-HT206B1-U1_ST_Bn1`

The gene order file that I use is:
`/diskmnt/Projects/Users/efang/SpatialInferCNV/siCNV_GeneOrderFile.tsv`

### Running the script

1. Activate the appropriate conda environment

   ```
   conda activate /diskmnt/Projects/Users/efang/miniconda3/envs/FindNormal2
   ```

2. Change directories to where the script is located

   ```
   cd /diskmnt/Projects/Users/efang/inferCNVVis/data_pre
   ```

3. Now we want to run the script

   ```
   python main.py /diskmnt/Datasets/Spatial_Transcriptomics/outputs_OCT/Human/HT206B1/H1/HT206B1-U1_ST_Bn1/outs /diskmnt/Projects/Users/efang/normalized_annotations2/HT206B1-U1_ST_Bn1-with_normal_annotations.csv /diskmnt/Projects/Users/efang/SpatialInferCNV/InferCNVRunsOutput2/InferCNVrun_outputs-HT206B1-U1_ST_Bn1/infercnv.observations.txt /diskmnt/Projects/Users/efang/SpatialInferCNV/siCNV_GeneOrderFile.tsv
   ```

4. Now the cleaned up data should be: `/diskmnt/Projects/Users/efang/inferCNVVis/data_pre/output_compressed.tsv`

5. Move the cleaned up data to your local machine
   ```
   scp <user>@katmai.wusm.wustl.edu:/diskmnt/Projects/Users/efang/inferCNVVis/data_pre/output_compressed.tsv ~/Downloads
   ```

### Serving the website

0. Install VSCode if you have not already
1. Open VSCode and install the live server extension
2. Clone this repository: `https://github.com/ericf1/infer-cnv-visualization.git`
3. Move the downloaded `output_compressed.tsv` into the website directory
4. Open the website directory, right click index.html, click on Open with Live Server
