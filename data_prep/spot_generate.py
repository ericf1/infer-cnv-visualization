import squidpy as sq
import pandas as pd


def spot_generate(spaceranger_path, annotation_path):
    adata = sq.read.visium(spaceranger_path)
    adata.var_names_make_unique()
    adata.obs["Barcode"] = adata.obs.index
    # get x,y location based on barcodes
    barcodes = pd.read_csv(annotation_path)
    barcodes = barcodes.merge(adata.obs, on="Barcode", how="right")

    # drop in_tissue column
    barcodes = barcodes.drop(columns=["in_tissue"])

    barcodes.to_csv("./spot.csv", index=False)


if __name__ == "__main__":
    spot_generate('/diskmnt/Datasets/Spatial_Transcriptomics/outputs_OCT/Human/HT206B1/H1/HT206B1-U1_ST_Bn1/outs',
                  "/diskmnt/Projects/Users/efang/normalized_annotations/HT206B1-U1_ST_Bn1-with_normal_annotations.csv")
