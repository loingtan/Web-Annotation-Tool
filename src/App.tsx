/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
// import {
//   S3Client,
//   ListObjectsV2Command,
//   GetObjectCommand,
// } from "@aws-sdk/client-s3";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
import "./App.css";
import TEST_SET_1 from "./assets/test_pos/test_set_1_output_pos.json";
import TEST_SET_2 from "./assets/test_pos/test_set_2_output_pos.json";
import TEST_SET_3 from "./assets/test_pos/test_set_3_output_pos.json";
import TEST_SET_4 from "./assets/test_pos/test_set_4_output_pos.json";
import TEST_SET_5 from "./assets/test_pos/test_set_5_output_pos.json";
import TEST_SET_6 from "./assets/test_pos/test_set_6_output_pos.json";
import TEST_SET_7 from "./assets/test_pos/test_set_7_output_pos.json";
import TEST_SET_8 from "./assets/test_pos/test_set_8_output_pos.json";
import TEST_SET_9 from "./assets/test_pos/test_set_9_output_pos.json";
import TEST_SET_10 from "./assets/test_pos/test_set_10_output_pos.json";

const TEST_SETS: Record<number, any[]> = {
  1: TEST_SET_1,
  2: TEST_SET_2,
  3: TEST_SET_3,
  4: TEST_SET_4,
  5: TEST_SET_5,
  6: TEST_SET_6,
  7: TEST_SET_7,
  8: TEST_SET_8,
  9: TEST_SET_9,
  10: TEST_SET_10,
};
const LABELS = [
  "N",
  "Np",
  "Nc",
  "Nu",
  "V",
  "A",
  "P",
  "L",
  "M",
  "R",
  "E",
  "C",
  "I",
  "T",
  "U",
  "Y",
  "X",
];
const EXP = [
  "Danh từ",
  "Danh từ riêng",
  "Danh từ chỉ loại",
  "Danh từ đơn vị",
  "Động từ",
  "Tính từ",
  "Đại từ",
  "Định từ",
  "Số từ",
  "Phó từ",
  "Giới từ",
  "Liên từ",
  "Thán từ",
  "Trợ từ, tình thái từ, tiểu từ",
  "Từ đơn lẻ",
  "Từ viết tắt",
  "Từ không phân loại",
];
const LABEL_COLORS: Record<string, string> = {
  N: "#FF5733", // Reddish Orange
  Np: "#00FFFF", // Cyan
  Nc: "#FFD700", // Gold
  Nu: "#FF00FF", // Magenta
  V: "#00FF00", // Lime
  A: "#FFA500", // Orange
  P: "#7DF9FF", // Electric Blue
  L: "#8A2BE2", // Blue Violet
  M: "#DC143C", // Crimson
  R: "#FF4500", // Orange Red
  E: "#ADFF2F", // Green Yellow
  C: "#7FFF00", // Chartreuse
  I: "#00CED1", // Dark Turquoise
  T: "#FF69B4", // Hot Pink
  U: "#6A5ACD", // Slate Blue
  Y: "#00FA9A", // Medium Spring Green
  X: "#8B0000", // Dark Red
};

// Annotator mapping (folder name to display name)
const ANNOTATORS: Record<string, string> = {
  phuong_ngan: "Annotator 1",
  le_ngoc: "Annotator 2",
  minh_ngoc: "Annotator 3",
};

interface AnnotationValue {
  start: number;
  end: number;
  text: string;
  labels: string[];
}

interface Annotator {
  email: string;
  id: number;
}

interface AnnotationFile {
  id: number;
  updated_at: string;
  completed_by: Annotator;
  result: {
    value: AnnotationValue;
    id: string;
    from_name: string;
    to_name: string;
    type: string;
    origin: string;
  }[];
  task: {
    data: {
      text: string;
    };
  };
  sourceFolder?: string;
}
const TextComparisonModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  text: string;
  annotatorFiles: Record<string, AnnotationFile | null>;
  annotatorNames: Record<string, string>;
  labelColors: Record<string, string>;
  correctAnnotations?: {
    plainText: string;
    annotations: { start: number; end: number; text: string; tag: string }[];
  };
}> = ({
  isOpen,
  onClose,
  text,
  annotatorFiles,
  annotatorNames,
  correctAnnotations,
}) => {
  if (!isOpen) return null;

  // Convert correct annotations to AnnotationValue format if they exist
  const formattedCorrectAnnotations = correctAnnotations?.annotations.map(
    (ann) => ({
      start: ann.start,
      end: ann.end,
      text: ann.text,
      labels: [ann.tag],
    })
  );
  console.log(correctAnnotations);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-full overflow-hidden flex flex-col">
        <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-950">
            So sánh annotation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-black">Văn bản gốc:</h3>
            <p className="text-gray-800">{text}</p>
          </div>

          {/* Show the correct annotation at the top if available */}
          {formattedCorrectAnnotations && (
            <div className="mb-6 border-2 border-yellow-400 rounded-lg p-4 relative">
              <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full">
                Nhãn chuẩn
              </div>
              <div className="mt-4">
                <HighlightedText
                  text={correctAnnotations?.plainText || ""}
                  annotations={formattedCorrectAnnotations}
                />
              </div>
              <div className="mt-2 text-sm font-medium text-yellow-600">
                {formattedCorrectAnnotations.length} nhãn từ bộ dữ liệu chuẩn
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {Object.entries(annotatorFiles).map(([folder, file]) => {
              if (!file) return null;

              return (
                <div key={folder} className="border rounded-lg p-4 relative">
                  <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full">
                    {annotatorNames[folder] || folder}
                  </div>

                  <div className="mt-4">
                    <HighlightedText
                      text={text}
                      annotations={file.result.map((r) => r.value)}
                    />
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {file.result.length} nhãn • Lần cập nhật cuối:{" "}
                    {new Date(file.updated_at).toLocaleString("vi-VN")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
//

const HighlightedText: React.FC<{
  text: string;
  annotations: AnnotationValue[];
}> = ({ text, annotations }) => {
  if (!text || !annotations.length)
    return <p className="text-annotation">{text}</p>;

  const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);
  const fragments = [];
  let lastIndex = 0;

  sortedAnnotations.forEach((annotation, index) => {
    if (annotation.start > lastIndex) {
      fragments.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, annotation.start)}
        </span>
      );
    }

    const label = annotation.labels[0];
    fragments.push(
      <div key={`highlight-container-${index}`} className="inline-block ">
        <div className="relative mt-10">
          <span className="absolute -top-5 left-0 text-xs font-bold px-1 rounded bg-gray-800 text-white whitespace-nowrap z-10">
            {label}
          </span>
          <span
            key={`highlight-${index}`}
            className="highlighted-text relative mb-2"
            style={{
              backgroundColor: LABEL_COLORS[label] || "#cccccc",
              padding: "0 3px",
              borderRadius: "4px",
              margin: "0 2px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {text.substring(annotation.start, annotation.end)}
          </span>
        </div>
      </div>
    );

    lastIndex = annotation.end;
  });

  if (lastIndex < text.length) {
    fragments.push(<span key="text-end">{text.substring(lastIndex)}</span>);
  }

  return <div className="text-annotation relative py-6">{fragments}</div>;
};

// Label legend component with improved styling
const LabelLegend: React.FC = () => {
  return (
    <div className="label-legend p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-3 text-lg text-black">Label Legend</h3>
      <div className="grid grid-cols-6 gap-3">
        {LABELS.map((label, i) => (
          <div key={label} className="flex items-center p-1 rounded">
            <span
              className="w-5 h-5 mr-2 inline-block rounded"
              style={{ backgroundColor: LABEL_COLORS[label] }}
            ></span>
            <span className="font-medium text-black">{label}</span>
            <span className="ml-2 text-gray-700">{EXP[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add state for selected set with a more dynamic approach

const AnnotationAnalysisApp: React.FC = () => {
  const [comparisonText, setComparisonText] = useState("");
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<number>(1);
  const [availableSets, setAvailableSets] = useState<number[]>([1]);
  const [customSetInput, setCustomSetInput] = useState<string>("");

  const [accuracyResults, setAccuracyResults] = useState<{
    annotatorAccuracy: Record<
      string,
      { accuracy: number; matches: number; total: number }
    >;
    averageAccuracy: number;
  } | null>(null);
  const [expandedAnnotator, setExpandedAnnotator] = useState<string | null>(
    null
  );
  const [annotatorAgreement, setAnnotatorAgreement] = useState<{
    pairwisePrecision?: Record<
      string,
      { precision: number; matches: number; total: number }
    >;
    averagePrecision?: number;
  } | null>(null);
  const [folderAnnotations, setFolderAnnotations] = useState<
    Record<string, AnnotationFile[]>
  >({});
  const [selectedAnnotator, setSelectedAnnotator] = useState<string | "all">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonFiles, setComparisonFiles] = useState<
    Record<string, AnnotationFile | null>
  >({});
  const [isUsingLocalFiles] = useState<boolean>(false);
  const [localAnnotationFiles] = useState<Record<string, AnnotationFile[]>>({});
  // const fileInputRef = React.useRef<HTMLInputElement>(null);

  const findMatchingFiles = (text: string) => {
    const matches: Record<string, AnnotationFile | null> = {};

    Object.entries(folderAnnotations).forEach(([folder, files]) => {
      // Try to find exact text match
      const match = files.find((file) => file.task.data.text === text);

      matches[folder] = match || null;
    });

    return matches;
  };
  const handleProcessTestFile = () => {
    let testData = TEST_SETS[0];

    if (1 <= selectedSet && selectedSet <= 10) {
      testData = TEST_SETS[selectedSet];
    }

    const processedTestData = testData.map((item) => {
      const taggedText = item.data.text;
      const pairs = taggedText.split(" ").filter((p: string) => p.trim());

      let plainText = "";
      const annotations: {
        start: number;
        end: number;
        text: string;
        tag: string;
      }[] = [];
      pairs.forEach((pair: string) => {
        const lastSlashIndex = pair.indexOf("/");

        if (lastSlashIndex > 0) {
          const word = pair.substring(0, lastSlashIndex);
          let tag = pair.substring(lastSlashIndex + 1);
          if (tag.indexOf("/") > 0) {
            tag = tag.split("/")[0];
          }
          const start = plainText.length > 0 ? plainText.length + 1 : 0;
          if (plainText.length > 0) {
            plainText += " ";
          }
          plainText += word;
          const end = plainText.length;
          if (tag !== word && tag != "" && word != "") {
            annotations.push({
              start,
              end,
              text: word,
              tag,
            });
          }
        }
      });

      return {
        plainText,
        annotations,
      };
    });

    // Calculate accuracy for each annotator
    const accuracyResults: Record<
      string,
      { accuracy: number; matches: number; total: number }
    > = {};

    // Process each annotator's files
    Object.entries(folderAnnotations).forEach(([folder, files]) => {
      let totalMatches = 0;
      let totalAnnotations = 0;

      files.forEach((file) => {
        const bestMatch = findBestMatchingTestData(
          file.task.data.text,
          processedTestData
        );

        if (bestMatch) {
          const sortedAnnotatorAnnotations = [...file.result]
            .sort((a, b) => a.value.start - b.value.start)
            .map((anno) => ({
              text: anno.value.text,
              tag: anno.value.labels[0],
            }));
          const sortedTestAnnotations = bestMatch
            ? [...bestMatch.annotations].sort((a, b) => a.start - b.start)
            : [];
          const minLength = Math.min(
            sortedAnnotatorAnnotations.length,
            sortedTestAnnotations.length
          );

          for (let i = 0; i < minLength; i++) {
            const annAnnotation = sortedAnnotatorAnnotations[i];
            const testAnnotation = sortedTestAnnotations[i];

            if (
              annAnnotation.text.toLowerCase() ===
                testAnnotation.text.toLowerCase() &&
              annAnnotation.tag === testAnnotation.tag
            ) {
              totalMatches++;
            }

            totalAnnotations++;
          }
          if (sortedAnnotatorAnnotations.length > minLength) {
            totalAnnotations += sortedAnnotatorAnnotations.length - minLength;
          }
        }
      });
      const accuracy =
        totalAnnotations > 0 ? totalMatches / totalAnnotations : 0;
      accuracyResults[folder] = {
        accuracy,
        matches: totalMatches,
        total: totalAnnotations,
      };
    });
    const totalAccuracy = Object.values(accuracyResults).reduce(
      (sum: any, result: any) => sum + result.accuracy,
      0
    );
    const averageAccuracy =
      Object.keys(accuracyResults).length > 0
        ? totalAccuracy / Object.keys(accuracyResults).length
        : 0;

    return {
      annotatorAccuracy: accuracyResults,
      averageAccuracy,
    };
  };

  // Helper function to find the best matching test data based on text similarity
  // Define an interface for the test data structure
  interface TestData {
    plainText: string;
    annotations: { start: number; end: number; text: string; tag: string }[];
  }

  const findBestMatchingTestData = (
    text: string,
    testDataArray: TestData[]
  ): TestData | null => {
    let bestMatch: TestData | null = null;
    let bestScore = -1;

    testDataArray.forEach((testData) => {
      // Calculate similarity between texts
      const similarity = calculateTextSimilarity(
        normalizeText(text),
        normalizeText(testData.plainText)
      );

      if (similarity > bestScore && similarity > 0.7) {
        // Threshold for considering a match
        bestScore = similarity;
        bestMatch = testData;
      }
    });

    return bestMatch;
  };
  const calculateTextSimilarity = (text1: string, text2: string) => {
    const maxLength = Math.max(text1.length, text2.length);
    if (maxLength === 0) return 1.0; // Both strings are empty

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(text1, text2);

    // Convert to similarity score
    return 1.0 - distance / maxLength;
  };

  // Calculate Levenshtein distance between two strings
  const levenshteinDistance = (s1: string, s2: string) => {
    const track = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i += 1) {
      track[0][i] = i;
    }

    for (let j = 0; j <= s2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return track[s2.length][s1.length];
  };

  // Normalize text for better comparison
  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();
  };
  // Add handler for comparison button
  const handleCompareText = (text: string) => {
    const matchingFiles = findMatchingFiles(text);
    setComparisonFiles(matchingFiles);
    setComparisonText(text);
    setIsComparisonModalOpen(true);
  };

  // Create a function that processes test data once to avoid repetition
  const processTestData = (testData: any[]) => {
    return testData.map((item) => {
      const taggedText = item.data.text;
      const pairs = taggedText.split(" ").filter((p: string) => p.trim());

      let plainText = "";
      const annotations: { start: number; end: number; text: any; tag: any }[] =
        [];

      // Process each word/tag pair
      pairs.forEach((pair: string) => {
        const lastSlashIndex = pair.indexOf("/");
        if (lastSlashIndex > 0) {
          const word = pair.substring(0, lastSlashIndex);

          let tag = pair.substring(lastSlashIndex + 1);
          if (tag.indexOf("/") > 0) {
            tag = tag.split("/")[0];
          }

          // Calculate start and end position for the annotation
          const start = plainText.length > 0 ? plainText.length + 1 : 0;
          if (plainText.length > 0) {
            plainText += " ";
          }
          plainText += word;
          const end = plainText.length;

          if (tag !== word && tag != "" && word != "") {
            annotations.push({
              start,
              end,
              text: word,
              tag,
            });
          }
        }
      });

      return {
        plainText,
        annotations,
      };
    });
  };
  // S3 Configuration
  // const s3Client = new S3Client({
  //   region: import.meta.env.VITE_AWS_REGION,
  //   credentials: {
  //     accessKeyId: import.meta.env.VITE_ACCESS_KEY_ID,
  //     secretAccessKey: import.meta.env.VITE_SECRET_ACCESS_KEY,
  //   },
  // });
  const [labelCounts, setLabelCounts] = useState<Record<
    string,
    Record<string, number>
  > | null>(null);
  const calculateAnnotatorLabelsPerSet = () => {
    const labelCounts: Record<string, Record<string, number>> = {};

    Object.entries(folderAnnotations).forEach(([folder, files]) => {
      // Khởi tạo đối tượng đếm nhãn cho annotator này
      labelCounts[folder] = {};

      // Đếm nhãn từ các annotations
      files.forEach((file) => {
        file.result.forEach((result) => {
          const labels = result.value.labels;

          // Đếm mỗi loại nhãn
          labels.forEach((label) => {
            if (!labelCounts[folder][label]) {
              labelCounts[folder][label] = 0;
            }
            labelCounts[folder][label]++;
          });
        });
      });
    });

    return labelCounts;
  };
  const fetchAnnotationFiles = async () => {
    if (isUsingLocalFiles) {
      loadLocalAnnotationFiles(selectedSet);
      return;
    }

    setIsLoading(true);
    try {
      // Try to load files from local assets first
      const localAssetFiles = await loadAnnotationFilesFromAssets(selectedSet);

      if (Object.keys(localAssetFiles).length > 0) {
        console.log("Loaded annotation files from local assets");
        setFolderAnnotations(localAssetFiles);
        return;
      }

      // If no local assets, fall back to S3
      // const allFiles: Record<string, AnnotationFile[]> = {};

      // // Fetch files from each annotator folder
      // for (const folder of Object.keys(ANNOTATORS)) {
      //   // Modify prefix based on selected set
      //   let prefixFolder = folder;
      //   if (selectedSet > 1) {
      //     prefixFolder = `${folder}_${selectedSet}`;
      //   }

      //   const command = new ListObjectsV2Command({
      //     Bucket: import.meta.env.VITE_S3_BUCKET,
      //     Prefix: `${prefixFolder}/`,
      //   });

      //   const response = await s3Client.send(command);

      //   const filePromises =
      //     response.Contents?.map(async (file) => {
      //       const getCommand = new GetObjectCommand({
      //         Bucket: import.meta.env.VITE_S3_BUCKET,
      //         Key: file.Key,
      //       });

      //       const fileResponse = await s3Client.send(getCommand);
      //       const fileText = await fileResponse.Body?.transformToString();

      //       try {
      //         const parsedFile = JSON.parse(fileText || "{}") as AnnotationFile;
      //         // Add source folder for tracking - use the original folder name for consistency
      //         parsedFile.sourceFolder = folder;
      //         return parsedFile;
      //       } catch {
      //         console.error("Error parsing file:", file.Key);
      //         return null;
      //       }
      //     }) || [];

      //   const folderFiles = (await Promise.all(filePromises))
      //     .filter((file): file is AnnotationFile => file !== null)
      //     .slice(0);

      //   if (!allFiles[folder]) {
      //     allFiles[folder] = [];
      //   }

      //   allFiles[folder].push(...folderFiles);
      // }
      // const new_allFiles = sortTextByTaskDataText(allFiles);
      // setFolderAnnotations(new_allFiles);
    } catch (error) {
      console.error("Error fetching annotation files", error);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateAnnotatorAgreement = () => {
    const annotatorKeys = Object.keys(folderAnnotations);

    if (annotatorKeys.length < 2) {
      console.error("Not enough annotators to calculate agreement");
      return;
    }

    try {
      // Calculate pairwise precision between annotators
      const pairwisePrecision: Record<
        string,
        { precision: number; matches: number; total: number }
      > = {};
      const allPrecisionScores = [];

      for (let i = 0; i < annotatorKeys.length; i++) {
        for (let j = i + 1; j < annotatorKeys.length; j++) {
          const annotator1 = annotatorKeys[i];
          const annotator2 = annotatorKeys[j];
          const pairKey = `${ANNOTATORS[annotator1]}-${ANNOTATORS[annotator2]}`;

          let totalMatches = 0;
          let totalAnnotations = 0;
          const files1 = folderAnnotations[annotator1];
          files1.forEach((file1) => {
            const file2 = folderAnnotations[annotator2].find(
              (f) => f.task.data.text === file1.task.data.text
            );
            if (file2) {
              const annotations1 = file1.result.map((r) => ({
                start: r.value.start,
                end: r.value.end,
                label: r.value.labels[0],
              }));

              const annotations2 = file2.result.map((r) => ({
                start: r.value.start,
                end: r.value.end,
                label: r.value.labels[0],
              }));
              annotations1.forEach((anno1) => {
                const matchingAnno = annotations2.find(
                  (anno2) =>
                    Math.abs(anno1.start - anno2.start) == 0 &&
                    Math.abs(anno1.end - anno2.end) == 0 &&
                    anno1.label === anno2.label
                );

                if (matchingAnno) {
                  totalMatches++;
                }
                totalAnnotations++;
              });
            }
          });

          const precision =
            totalAnnotations > 0 ? totalMatches / totalAnnotations : 0;
          pairwisePrecision[pairKey] = {
            precision,
            matches: totalMatches,
            total: totalAnnotations,
          };

          allPrecisionScores.push(precision);
        }
      }

      // Calculate average precision across all pairs
      const averagePrecision =
        allPrecisionScores.length > 0
          ? allPrecisionScores.reduce((sum, score) => sum + score, 0) /
            allPrecisionScores.length
          : 0;

      // Update the state with only precision-based metrics
      setAnnotatorAgreement({
        pairwisePrecision,
        averagePrecision,
      });
    } catch (error) {
      console.error("Error calculating agreement", error);
    }
  };
  const sortTextByTaskDataText = (
    folderAnnotations: Record<string, AnnotationFile[]>
  ) => {
    return Object.fromEntries(
      Object.entries(folderAnnotations).map(([folder, files]) => [
        folder,
        files.sort((a, b) =>
          a.task.data.text
            .toLowerCase()
            .localeCompare(b.task.data.text.toLowerCase())
        ),
      ])
    );
  };
  const calculateTestDataLabelCounts = () => {
    // Lấy test data cho set hiện tại
    const testData =
      1 <= selectedSet && selectedSet <= 10
        ? TEST_SETS[selectedSet]
        : TEST_SETS[1];

    // Khởi tạo đối tượng đếm nhãn
    const labelCounts: Record<string, number> = {};

    // Xử lý và đếm nhãn
    const processedData = processTestData(testData);

    processedData.forEach((item) => {
      item.annotations.forEach((annotation) => {
        const label = annotation.tag;
        if (!labelCounts[label]) {
          labelCounts[label] = 0;
        }
        labelCounts[label]++;
      });
    });

    return labelCounts;
  };
  // const downloadAllAnnotationFiles = async () => {
  //   setIsLoading(true);
  //   try {
  //     const zip = new JSZip();

  //     // For each annotator
  //     for (const folder of Object.keys(ANNOTATORS)) {
  //       // Download files for all sets (1-10)
  //       for (let setNum = 8; setNum <= 10; setNum++) {
  //         // Determine the correct prefix based on set number
  //         let prefixFolder = folder;
  //         if (setNum > 1) {
  //           prefixFolder = `${folder}_${setNum}`;
  //         }

  //         // Create a folder in the zip with the exact prefix name
  //         const prefixFolderInZip = zip.folder(prefixFolder);
  //         if (!prefixFolderInZip) continue;

  //         // List objects from S3
  //         const command = new ListObjectsV2Command({
  //           Bucket: import.meta.env.VITE_S3_BUCKET,
  //           Prefix: `${prefixFolder}/`,
  //         });

  //         const response = await s3Client.send(command);

  //         if (response.Contents && response.Contents.length > 0) {
  //           // Download each file in this set
  //           for (const file of response.Contents) {
  //             if (file.Key && !file.Key.endsWith("/")) {
  //               const getCommand = new GetObjectCommand({
  //                 Bucket: import.meta.env.VITE_S3_BUCKET,
  //                 Key: file.Key,
  //               });

  //               const fileResponse = await s3Client.send(getCommand);
  //               const fileText = await fileResponse.Body?.transformToString();

  //               if (fileText) {
  //                 // Extract filename from the full path
  //                 const fileName = file.Key.split("/").pop();
  //                 if (fileName) {
  //                   // Add the file to zip, preserving the original prefix
  //                   prefixFolderInZip.file(fileName, fileText);
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }

  //     // Generate and save the zip file
  //     const content = await zip.generateAsync({ type: "blob" });
  //     saveAs(content, "annotation_files.zip");
  //   } catch (error) {
  //     console.error("Error downloading annotation files", error);
  //     alert("Error downloading files. See console for details.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const loadLocalAnnotationFiles = (setNum: number) => {
    console.log("Loading local annotation files...");
    setIsLoading(true);
    try {
      const allFiles: Record<string, AnnotationFile[]> = {};

      // For each prefix in localAnnotationFiles
      Object.entries(localAnnotationFiles).forEach(([prefix, files]) => {
        // Check if this prefix belongs to the current set
        let prefixSetNum = 1;
        const prefixParts = prefix.split("_");

        if (prefixParts.length > 2) {
          // Format like "folder_name_2"
          const potentialSetNum = parseInt(
            prefixParts[prefixParts.length - 1],
            10
          );
          if (!isNaN(potentialSetNum)) {
            prefixSetNum = potentialSetNum;
          }
        }

        // Only include files from the selected set
        if (prefixSetNum === setNum) {
          // Get the base folder name from the prefix
          let baseFolder = prefix;
          if (prefixSetNum > 1) {
            // Remove the set number suffix to get the base folder
            const parts = prefix.split("_");
            baseFolder = parts.slice(0, -1).join("_");
          }

          // Initialize if needed
          if (!allFiles[baseFolder]) {
            allFiles[baseFolder] = [];
          }

          // Add files to the result
          allFiles[baseFolder].push(...files);
        }
      });

      const sortedFiles = sortTextByTaskDataText(allFiles);
      setFolderAnnotations(sortedFiles);
    } catch (error) {
      console.error("Error loading local annotation files", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnnotationFilesFromAssets = async (selectedSet: number) => {
    const allFiles: Record<string, AnnotationFile[]> = {};

    try {
      // Get folder names based on annotator keys and set number
      for (const folder of Object.keys(ANNOTATORS)) {
        // Determine the correct prefix based on set number
        let prefixFolder = folder;
        if (selectedSet > 1) {
          prefixFolder = `${folder}_${selectedSet}`;
        }

        try {
          // Use dynamic import to load all files from the folder
          const files = import.meta.glob("/src/assets/annotation_files/**/*", {
            as: "raw", // Import as raw text instead of trying to parse as module
            eager: true,
          });

          // Filter files that match our folder prefix
          const folderFiles: AnnotationFile[] = [];

          for (const path in files) {
            // Check if the path contains our prefix folder
            if (path.includes(`/annotation_files/${prefixFolder}/`)) {
              try {
                // Get the file content as raw text and parse it manually
                const fileContent = files[path] as string;
                // Parse the JSON content
                const parsedFile = JSON.parse(fileContent) as AnnotationFile;

                // Add source folder for tracking
                parsedFile.sourceFolder = folder;
                folderFiles.push(parsedFile);
              } catch (error) {
                console.error(`Error parsing file from ${path}:`, error);
              }
            }
          }

          if (folderFiles.length > 0) {
            if (!allFiles[folder]) {
              allFiles[folder] = [];
            }
            allFiles[folder].push(...folderFiles);
          }
        } catch (error) {
          console.error(
            `Error loading files for folder ${prefixFolder}:`,
            error
          );
        }
      }

      return sortTextByTaskDataText(allFiles);
    } catch (error) {
      console.error("Error loading annotation files from assets:", error);
      return {};
    }
  };

  const initializeAvailableSetsFromAssets = async () => {
    try {
      const files = import.meta.glob("/src/assets/annotation_files/**/*", {
        as: "raw", // Use raw import
        eager: true,
      });
      const availableSetsFound = new Set<number>();

      // Default set is always available
      availableSetsFound.add(1);

      for (const path in files) {
        // Extract the folder name from the path
        const match = path.match(/\/annotation_files\/([^/]+)/);
        if (match && match[1]) {
          const folderName = match[1];
          // Check if it's a set folder (e.g., phuong_ngan_2)
          const folderParts = folderName.split("_");
          if (folderParts.length > 2) {
            const potentialSetNum = parseInt(
              folderParts[folderParts.length - 1],
              10
            );
            if (!isNaN(potentialSetNum)) {
              availableSetsFound.add(potentialSetNum);
            }
          }
        }
      }

      return Array.from(availableSetsFound).sort((a, b) => a - b);
    } catch (error) {
      console.error("Error detecting available sets:", error);
      return [1]; // Default to set 1 if there's an error
    }
  };
  // Add this function to your AnnotationAnalysisApp component
  // const handleLocalFilesUpload = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const files = event.target.files;
  //   if (!files || files.length === 0) return;

  //   setIsLoading(true);

  //   const zip = files[0];
  //   const reader = new FileReader();

  //   reader.onload = async (e) => {
  //     try {
  //       if (!e.target?.result) throw new Error("Failed to read zip file");

  //       const zipData = await JSZip.loadAsync(e.target.result);
  //       const localFiles: Record<string, AnnotationFile[]> = {};

  //       // Process each file in the zip
  //       const filePromises: Promise<void>[] = [];

  //       zipData.forEach((relativePath, zipEntry) => {
  //         if (!zipEntry.dir) {
  //           // Path format: prefixFolder/filename.json
  //           const pathParts = relativePath.split("/");
  //           if (pathParts.length >= 1) {
  //             const prefixFolder = pathParts[0]; // This is the original prefix (e.g., "phuong_ngan" or "phuong_ngan_2")
  //             const fileName = pathParts[1]; // The actual filename

  //             if (fileName) {
  //               const promise = zipEntry.async("string").then((content) => {
  //                 try {
  //                   const parsedFile = JSON.parse(content) as AnnotationFile;

  //                   // Extract the base folder name and set number from the prefix
  //                   let baseFolder = prefixFolder;
  //                   let setNum = 1;

  //                   const prefixParts = prefixFolder.split("_");
  //                   if (prefixParts.length > 2) {
  //                     // Format like "folder_name_2"
  //                     setNum = parseInt(
  //                       prefixParts[prefixParts.length - 1],
  //                       10
  //                     );
  //                     if (!isNaN(setNum)) {
  //                       baseFolder = prefixParts.slice(0, -1).join("_");
  //                     }
  //                   }

  //                   // Store the original prefix information
  //                   parsedFile.sourceFolder = baseFolder;

  //                   // Initialize nested structure if needed
  //                   if (!localFiles[prefixFolder]) {
  //                     localFiles[prefixFolder] = [];
  //                   }

  //                   localFiles[prefixFolder].push(parsedFile);
  //                 } catch (error) {
  //                   console.error("Error parsing file:", relativePath, error);
  //                 }
  //               });

  //               filePromises.push(promise);
  //             }
  //           }
  //         }
  //       });

  //       // Wait for all files to be processed
  //       await Promise.all(filePromises);

  //       setLocalAnnotationFiles(localFiles);
  //       setIsUsingLocalFiles(true);

  //       // Determine available sets from the prefixes
  //       const availableSetsFound = new Set<number>();
  //       availableSetsFound.add(1); // Always include set 1 as available

  //       Object.keys(localFiles).forEach((prefix) => {
  //         // Extract set number from prefix if it exists
  //         const prefixParts = prefix.split("_");
  //         if (prefixParts.length > 2) {
  //           const potentialSetNum = parseInt(
  //             prefixParts[prefixParts.length - 1],
  //             10
  //           );
  //           if (!isNaN(potentialSetNum)) {
  //             availableSetsFound.add(potentialSetNum);
  //           }
  //         }
  //       });

  //       setAvailableSets(Array.from(availableSetsFound).sort((a, b) => a - b));

  //       // Load the first set
  //       if (availableSetsFound.size > 0) {
  //         const firstSet = Math.min(...availableSetsFound);
  //         setSelectedSet(firstSet);
  //         loadLocalAnnotationFiles(firstSet);
  //       }

  //       console.log("Successfully loaded local files from zip");
  //     } catch (error) {
  //       console.error("Error processing zip file", error);
  //       alert("Error processing zip file. See console for details.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   reader.onerror = () => {
  //     console.error("Error reading file");
  //     setIsLoading(false);
  //   };

  //   reader.readAsArrayBuffer(zip);
  // };
  useEffect(() => {
    // Initialize available sets from local assets
    const initializeSets = async () => {
      const detectedSets = await initializeAvailableSetsFromAssets();
      setAvailableSets(detectedSets);
    };

    initializeSets();
    fetchAnnotationFiles();
  }, []);

  useEffect(() => {
    fetchAnnotationFiles();
  }, [selectedSet]);

  const toggleAccordion = (annotator: string) => {
    setExpandedAnnotator(expandedAnnotator === annotator ? null : annotator);
  };

  // Add custom CSS to handle the annotation display with labels
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .text-annotation {
        line-height: 2.5;
        margin-top: 1.5rem;
        position: relative;
      }
      .highlighted-text {
        position: relative;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Annotation Analysis
      </h1>

      {/* Annotator selection */}
      <div className="mb-6 p-4 border-b-black border-4 rounded-lg text-black">
        <h2 className="text-lg font-semibold mb-3">Chọn Annotator</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md transition-colors text-white ${
              selectedAnnotator === "all"
                ? "bg-red-900 text-white"
                : "bg-amber-400 hover:bg-blue-900"
            }`}
            onClick={() => setSelectedAnnotator("all")}
          >
            Toàn bộ Annotators
          </button>
          {Object.entries(ANNOTATORS).map(([folder, name]) => (
            <button
              key={folder}
              className={`px-4 py-2 rounded-md transition-colors text-white ${
                selectedAnnotator === folder
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedAnnotator(folder)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6 p-4 bg-white  border-black border-4 rounded-lg text-black">
        <h2 className="text-lg font-semibold mb-3">Chọn bộ dữ liệu</h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {availableSets.map((setNumber) => (
            <button
              key={setNumber}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedSet === setNumber
                  ? "bg-purple-600 text-red-400"
                  : "bg-gray-200 text-white hover:bg-gray-300"
              }`}
              onClick={() => setSelectedSet(setNumber)}
            >
              Bộ dữ liệu {setNumber}
              {setNumber === 1 ? " (mặc định)" : ""}
            </button>
          ))}
        </div>

        <div className="flex items-center mt-3">
          <input
            type="number"
            min="1"
            value={customSetInput}
            onChange={(e) => setCustomSetInput(e.target.value)}
            placeholder="Set #"
            className="w-20 px-2 py-1 border rounded-l"
          />
          <button
            onClick={() => {
              const setNum = parseInt(customSetInput, 10);
              if (
                setNum >= 1 &&
                setNum <= 10 &&
                !availableSets.includes(setNum)
              ) {
                // Add new set to available sets
                setAvailableSets((prev) =>
                  [...prev, setNum].sort((a, b) => a - b)
                );
                // Select the new set
                setSelectedSet(setNum);
                // Clear the input
                setCustomSetInput("");
              } else if (setNum > 10) {
                alert("Số bộ dữ liệu không được lớn hơn 10");
              }
            }}
            disabled={
              !customSetInput ||
              isNaN(parseInt(customSetInput, 10)) ||
              parseInt(customSetInput, 10) < 1
            }
            className="px-3 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-gray-400"
          >
            Thêm bộ dữ liệu
          </button>

          {selectedSet !== 1 && (
            <button
              onClick={() => {
                setAvailableSets((prev) =>
                  prev.filter((s) => s !== selectedSet)
                );
                setSelectedSet(1); // Default to set 1 after removal
              }}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              title="Xóa bộ dữ liệu hiện tại khỏi danh sách"
            >
              Xóa bộ {selectedSet}
            </button>
          )}
        </div>

        {isLoading && (
          <div className="mt-3 text-sm text-gray-600">
            Đang tải dữ liệu từ bộ {selectedSet}...
          </div>
        )}

        <p className="mt-3 text-xs text-gray-500">
          <i>
            Lưu ý: Bộ dữ liệu 1 là mặc định (không có hậu tố). Các bộ khác sẽ
            thêm hậu tố "_X" vào tên thư mục (ví dụ: folder_2, folder_3).
          </i>
        </p>
      </div>
      <div className="mb-8">
        <LabelLegend />
      </div>
      <div className="mb-8 p-4 bg-black rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-amber-50">
          Thống kê nhãn theo Annotator
        </h2>
        <button
          onClick={() => {
            const annotatorCounts = calculateAnnotatorLabelsPerSet();
            const testCounts = calculateTestDataLabelCounts();
            setLabelCounts({ ...annotatorCounts, test_data: testCounts });
          }}
          className="bg-purple-500 text-white px-5 py-2 rounded-md hover:bg-purple-600 transition-colors"
          disabled={isLoading}
        >
          Thống kê nhãn
        </button>

        {labelCounts && (
          <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
            <h3 className="font-bold text-lg text-center mb-4 text-black">
              Thống kê số nhãn cho bộ dữ liệu {selectedSet}
            </h3>

            <div className="overflow-x-auto text-black">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Annotator</th>
                    {LABELS.map((label) => (
                      <th key={label} className="border p-2 text-center">
                        {label}
                      </th>
                    ))}
                    <th className="border p-2 text-center font-bold">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(labelCounts).map(([folder, counts]) => {
                    const total = Object.values(counts).reduce(
                      (sum, count) => sum + count,
                      0
                    );

                    return (
                      <tr key={folder} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">
                          {ANNOTATORS[folder] || folder}
                        </td>
                        {LABELS.map((label) => (
                          <td key={label} className="border p-2 text-center">
                            {counts[label] || 0}
                          </td>
                        ))}
                        <td className="border p-2 text-center font-bold">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="mb-8 p-4 bg-black rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-amber-50">
          Độ đồng thuận Annotator
        </h2>
        <button
          onClick={calculateAnnotatorAgreement}
          className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Data đang load" : "Tính độ đồng thuận"}
        </button>

        {annotatorAgreement !== null && (
          <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
            {/* Display precision-based metrics */}
            <div className="mb-4">
              <h3 className="font-bold text-lg text-center text-black mb-3">
                Kết quả đánh giá độ đồng thuận
              </h3>
              {/* <div className="p-3 border rounded-lg bg-blue-50 mb-4">
                <h4 className="font-semibold text-black">
                  Độ đồng thuận trung bình
                </h4>
                <div className="text-2xl font-semibold text-blue-600">
                  {(annotatorAgreement.averagePrecision !== undefined
                    ? annotatorAgreement.averagePrecision * 100
                    : 0
                  ).toFixed(2)}
                  %
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tỷ lệ trung bình các nhãn giống nhau giữa các cặp annotator
                </p>
              </div> */}
            </div>

            {/* Display pairwise precision between annotators */}
            <h4 className="font-semibold text-black mb-3">
              Độ đồng thuận giữa các Annotator
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {annotatorAgreement.pairwisePrecision &&
                Object.entries(annotatorAgreement.pairwisePrecision).map(
                  ([pairKey, data]) => (
                    <div
                      key={pairKey}
                      className="p-3 border rounded-lg bg-green-50"
                    >
                      <h4 className="font-semibold text-black">{pairKey}</h4>
                      <div className="text-xl font-bold text-green-600">
                        {(data.precision * 100).toFixed(2)}%
                      </div>
                      {/* <p className="text-sm text-gray-600">
                        {data.matches} giống nhau trên tổng {data.total} nhãn
                      </p> */}
                    </div>
                  )
                )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-black rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-amber-50">
          Đánh giá độ chính xác Annotation
        </h2>
        <button
          onClick={() => {
            const results = handleProcessTestFile();
            setAccuracyResults(results);
          }}
          className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-colors"
          disabled={isLoading}
        >
          Tính độ chính xác
        </button>

        {accuracyResults && (
          <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
            <h3 className="font-bold text-lg text-center mb-4 text-black">
              Kết quả đánh giá độ chính xác
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(accuracyResults.annotatorAccuracy).map(
                ([folder, result]) => (
                  <div
                    key={folder}
                    className="p-3 border rounded-lg bg-yellow-50"
                  >
                    <h4 className="font-semibold text-black">
                      {ANNOTATORS[folder] || folder}
                    </h4>
                    <div className="text-xl font-bold text-yellow-600">
                      {(result.accuracy * 100).toFixed(2)}%
                    </div>
                    {/* <p className="text-sm text-gray-600">
                      {result.matches} đúng trên tổng số {result.total} nhãn
                    </p> */}
                  </div>
                )
              )}
              <div className="p-3 border rounded-lg bg-blue-50">
                <h4 className="font-semibold text-black">
                  Độ chính xác trung bình
                </h4>
                <div className="text-xl font-bold text-blue-600">
                  {(accuracyResults.averageAccuracy * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download and Local Files UI */}
      {/* <div className="mb-6 p-4 bg-white border-black border-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-black">
          Tải xuống & Sử dụng dữ liệu cục bộ
        </h2>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={downloadAllAnnotationFiles}
            className={`px-4 py-2 rounded-md transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
            disabled={isLoading}
          >
            {isLoading ? "Đang tải..." : "Tải xuống tất cả dữ liệu"}
          </button>

          <span className="mx-2 text-gray-500">hoặc</span>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLocalFilesUpload}
              accept=".zip"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2 rounded-md transition-colors ${
                isUsingLocalFiles
                  ? "bg-blue-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${isUsingLocalFiles ? "text-white" : "text-black"}`}
            >
              {isUsingLocalFiles
                ? "Đang sử dụng dữ liệu cục bộ"
                : "Chọn file zip đã tải xuống"}
            </button>
          </div>

          {isUsingLocalFiles && (
            <button
              onClick={() => {
                setIsUsingLocalFiles(false);
                fetchAnnotationFiles();
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Quay lại dùng dữ liệu từ S3
            </button>
          )}
        </div>

        {isUsingLocalFiles && (
          <div className="mt-3 text-sm text-green-600">
            <span className="font-medium">✓</span> Đang sử dụng dữ liệu cục bộ
            đã tải lên - {Object.keys(localAnnotationFiles).length} thư mục được
            tìm thấy
          </div>
        )}

        <p className="mt-3 text-xs text-gray-500">
          <i>
            Bạn có thể tải tất cả dữ liệu xuống để sử dụng offline. Khi đã tải
            xuống, bạn có thể tải lên file zip để sử dụng thay vì tải từ S3 mỗi
            lần. Cấu trúc thư mục gốc sẽ được bảo toàn với tên prefix đầy đủ.
          </i>
        </p>
      </div> */}

      {/* Add this below the "Download & Local Files" section */}
      <div className="mb-6 p-4 bg-white border-black border-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-black">
          Trạng thái nguồn dữ liệu
        </h2>

        <div className="flex flex-col gap-2">
          <div className="p-3 border rounded-lg bg-green-50 text-green-800">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                Dữ liệu được tải từ thư mục local:
              </span>
            </div>
            <div className="mt-1 ml-7 text-sm">
              <code>src/assets/annotation_files</code>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <p>
              <strong>Bộ dữ liệu hiện tại:</strong> {selectedSet}
            </p>
            <p>
              <strong>Bộ dữ liệu có sẵn:</strong> {availableSets.join(", ")}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          <i>
            Hệ thống tự động nạp dữ liệu từ thư mục local trước khi tìm kiếm
            trên S3. Cấu trúc thư mục tuân theo quy tắc: [tên_annotator]_[số_bộ]
            (ví dụ: phuong_ngan_2).
          </i>
        </p>
      </div>

      {isLoading ? (
        <div className="text-center p-12">
          <p className="text-lg">Loading annotation data...</p>
          <div className="mt-4 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="border rounded-lg divide-y shadow-sm">
          {Object.entries(ANNOTATORS)
            .filter(
              ([folder]) =>
                selectedAnnotator === "all" || selectedAnnotator === folder
            )
            .map(([folder, name]) => {
              const annotatorFiles = folderAnnotations[folder] || [];
              if (annotatorFiles.length === 0 && selectedAnnotator !== "all") {
                return null;
              }

              return (
                <div key={folder} className="accordion-item">
                  <button
                    className="w-full p-4 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleAccordion(folder)}
                  >
                    <div>
                      <span className="font-medium text-lg">{name}</span>
                      <span className="ml-3 text-sm text-gray-500">
                        ({annotatorFiles.length} annotation
                        {annotatorFiles.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <span className="text-xl text-blue-500">
                      {expandedAnnotator === folder ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedAnnotator === folder && (
                    <div className="p-4 bg-white">
                      {annotatorFiles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No annotations found for this annotator
                        </div>
                      ) : (
                        annotatorFiles.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="mb-8 pb-6 border-b last:border-0"
                          >
                            <div className="flex justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-950">
                                Câu {fileIndex + 1}
                              </h3>
                              {file.completed_by && (
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {file.completed_by.email}
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  handleCompareText(file.task.data.text)
                                }
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                                  />
                                </svg>
                                So sánh
                              </button>
                            </div>

                            <HighlightedText
                              text={file.task.data.text}
                              annotations={file.result.map((r) => r.value)}
                            />

                            <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-x-6">
                              <p>
                                <span className="font-medium">
                                  Lần cập nhật cuối:
                                </span>{" "}
                                {new Date(file.updated_at).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                              <p>
                                {file.result.length}
                                <span className="font-medium"> nhãn</span>{" "}
                              </p>
                              <p>
                                <span className="font-medium">ID:</span>{" "}
                                {file.id}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
      <TextComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        text={comparisonText}
        annotatorFiles={comparisonFiles}
        annotatorNames={ANNOTATORS}
        labelColors={LABEL_COLORS}
        correctAnnotations={
          findBestMatchingTestData(
            comparisonText,
            processTestData(
              1 <= selectedSet && selectedSet <= 10
                ? TEST_SETS[selectedSet]
                : TEST_SETS[1]
            )
          ) || undefined
        }
      />
    </div>
  );
};

export default AnnotationAnalysisApp;
