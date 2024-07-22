"use client";
import React, { useState } from "react";
import {
  Document,
  Page,
  Image,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import {
  FolderArrowDownIcon,
  MinusIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: 10,
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "extrabold",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  imageContainer: {
    width: "30%",
    height: 200,
    margin: "1%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    height: "auto",
    width: "auto",
  },
  input: {
    maxWidth: "70%",
    maxHeight: "70%",
    height: "auto",
    width: "auto",
  },
  similarityText: {
    marginTop: 5,
    fontSize: 8,
  },
});

const MyDocument = ({ topImage, inputRipeness, imageInput }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Input Image:</Text>
      </View>
      <View>
        <Image src={URL.createObjectURL(imageInput)} style={styles.input} />
        <Text>Ripeness: {inputRipeness.toFixed(2)}%</Text>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Top Result:</Text>
      </View>
      <View style={styles.imagesContainer}>
        <View style={styles.imageContainer}>
          <Image
            src={`data:image/jpeg;base64,${topImage.base64imagedata}`}
            style={styles.image}
          />
          <Text style={styles.similarityText}>
            Similarity: {topImage.similaritypercentage.toFixed(2)}%
          </Text>
          <Text style={styles.similarityText}>
            Ripeness: {topImage.ripeness.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

const Result = ({ data, inputImage, time }) => {
  const [customFileName, setCustomFileName] = useState("");

  const topImage = data.similar_images[0];

  const downloadPDF = async () => {
    const doc = (
      <MyDocument
        topImage={topImage}
        imageInput={inputImage}
        inputRipeness={data.input_image_ripeness}
      />
    );
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    saveAs(blob, `${customFileName || "download"}.pdf`);
  };

  const gridHeight = "422px";

  return (
    <div className="bg-[#373737] bg-opacity-70 px-8 pb-8 mt-20 mx-80 rounded-t-3xl flex flex-col items-center justify-center">
      <MinusIcon className="h-12 text-black w-12 cursor-pointer hover:text-gray-500" />
      <div>
        <h2 className="text-white text-lg text-center">Result</h2>
        <p className="text-white text-sm text-center mb-2">{time.toFixed(3)} ms</p>
      </div>
      <input
        type="text"
        value={customFileName}
        onChange={(e) => setCustomFileName(e.target.value)}
        placeholder="Enter file name"
        className="mb-2 filename-input text-sm bg-[#373737] bg-opacity-70 rounded-2xl px-2 placeholder:italic"
      />
      <FolderArrowDownIcon
        className="h-6 mb-4 cursor-pointer"
        onClick={downloadPDF}
      />
      <div
        style={{ minHeight: gridHeight }}
        className="grid grid-cols-1 gap-x-12 gap-y-4"
      >
        {topImage ? (
          <div
            className="imageHover relative aspect-square h-48 rounded-2xl overflow-hidden"
          >
            <img
              src={`data:image/jpeg;base64,${topImage.base64imagedata}`}
              className="rounded-2xl w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-40 font-bold rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm bg-black p-2 rounded-xl">
                similarity: {topImage.similaritypercentage.toFixed(2)} %<br/>
                ripeness: {topImage.ripeness.toFixed(2)} %
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <ChevronUpIcon className="h-12 text-black w-12 cursor-pointer hover:text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
