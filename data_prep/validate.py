import pandas as pd
import numpy as np


def validate(gene_order_file='/Users/human/infercnv_visualization/data/siCNV_GeneOrderFile.tsv', compression=True):
    print("beginning data conversion into tsv")
    # load the matrix from a CSV file
    df_input = pd.read_csv('./output.csv')
    # df_input = pd.read_csv(
    #     "/Users/human/infercnv_visualization/data/output.csv")
    gene_order = pd.read_csv(
        gene_order_file, header=None, sep="\t")
    spots = pd.read_csv("./spot.csv")
    matrix = df_input.values

    # convert spots to a tsv file
    # replace array_row with y and array_col with x
    spots_tsv = spots.copy()
    spots_tsv = spots_tsv.rename(columns={"array_row": "y", "array_col": "x"})
    # rename the second row to be annotation
    spots_tsv = spots_tsv.rename(columns={spots_tsv.columns[1]: "annotation"})
    # if annotation is "normal" remove it
    spots_tsv = spots_tsv[spots_tsv.annotation != "normal"]
    spots_tsv.to_csv("spot.tsv", index=False, sep="\t")
    # print(df_input)

    print("spots.tsv generated")

    # aggregate the matrix by taking the mean of every 10 rows
    # matrix = matrix.reshape(-1, 10, matrix.shape[1]).mean(axis=1)

    # get the indices of the matrix
    rows, cols = np.indices(matrix.shape)
    # print(cols)
    barcodes = np.array(df_input.columns)
    # remove everything before the first underscore

    def clean_string(string):
        first = string.partition("_")[2]
        second = np.char.replace(first, '"', '')
        return np.char.replace(second, '.', '-')

    barcodes = np.vectorize(clean_string)(barcodes)
    barcodes = pd.DataFrame(barcodes)
    merged_barcodes = pd.merge(barcodes, spots, left_on=0,
                               right_on=spots.columns[0])

    barcode_matrix = np.tile(barcodes, (matrix.shape[0], 1))
    array_row_matrix = np.tile(
        merged_barcodes['array_row'], (matrix.shape[0], 1))
    array_col_matrix = np.tile(
        merged_barcodes['array_col'], (matrix.shape[0], 1))
    annotation_matrix = np.tile(
        merged_barcodes[merged_barcodes.columns[2]], (matrix.shape[0], 1))

    genes = np.array(df_input.index)
    genes = pd.DataFrame(genes)
    # get the type of column 0

    genes = genes.apply(lambda x: x.str.replace('"', ''))
    # convert the first column to int64
    gene_order[0] = gene_order[0].astype(str)

    # match the genes to the gene_order's index
    merged = pd.merge(pd.DataFrame(genes), gene_order, left_on=0, right_on=0)

    genes_matrix = np.tile(genes, (matrix.shape[1], 1))
    chromosome_matrix = np.tile(merged[1], (matrix.shape[1], 1)).T

    print("genes and chromosome matrix created")

    # flatten and stack the indices and values
    data = np.stack(
        (rows.ravel(), cols.ravel(), matrix.ravel(), barcode_matrix.ravel(), genes_matrix.ravel(), chromosome_matrix.ravel(), array_col_matrix.ravel(), array_row_matrix.ravel(), annotation_matrix.ravel()), axis=-1)

    # create a new pandas DataFrame
    df_output = pd.DataFrame(data, columns=[
        "x", "y", "ix", "barcode", "gene", "chr", "array_col", "array_row", "annotation"])

    # encode the annotations as integers from 0.0 to n.0
    df_output['annotation_int'] = pd.factorize(
        df_output['annotation'])[0].astype(np.int64)

    df_output['chr_int'] = pd.factorize(df_output['chr'])[0].astype(np.int64)

    print("mapping into integers")
    df_grouped = df_output.copy()
    # group by the y column
    df_grouped = df_grouped.sort_values(by=['y', 'x'])

    df_grouped = df_grouped.reset_index(drop=True)
    df_grouped = df_grouped[['y', 'ix', 'annotation_int', 'chr_int']]
    # sort by y

    df_grouped = df_grouped.groupby(df_grouped.index // 20).mean()

    # remap annotation int to closest integer
    df_grouped['annotation_int'] = df_grouped['annotation_int'].round()
    df_grouped['chr_int'] = df_grouped['chr_int'].round()

    df_grouped['y'] = df_grouped['y'].astype(float)
    df_grouped['y'] = df_grouped['y'].round()

    df_grouped['x'] = df_grouped.groupby(
        df_grouped['y'].diff().ne(0).cumsum()).cumcount()

    # remap the annotations to the original values
    df_grouped['annotation'] = df_grouped['annotation_int'].map(
        dict(zip(df_grouped['annotation_int'].unique(), df_output['annotation'].unique())))

    df_grouped['chr'] = df_grouped['chr_int'].map(
        dict(zip(df_grouped['chr_int'].unique(), df_output['chr'].unique())))

    df_grouped['barcode'] = df_grouped['y'].map(
        dict(zip(df_grouped['y'].unique(), df_output['barcode'].unique())))

    # remove the annotation_int and chr_int columns
    df_grouped = df_grouped.drop(['annotation_int', 'chr_int'], axis=1)

    print("finished approximating annotation and chromosome values")

    if compression:
        # df_grouped = df_grouped.reset_index(drop=True)
        df_grouped.to_csv("./output_compressed.tsv", index=False, sep="\t")
    else:
        df_output.to_csv("./output.tsv", index=False, sep="\t")


if __name__ == "__main__":
    validate()
