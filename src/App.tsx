import React, { useState, useEffect } from "react";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import "./App.css";

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
const ANNOTATORS = {
  phuong_ngan: "Phương Ngân",
  le_ngoc: "Lê Ngọc",
  minh_ngoc: "Minh Ngọc",
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
}> = ({ isOpen, onClose, text, annotatorFiles, annotatorNames }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 overflow-hidden flex flex-col">
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
                    {file.result.length} annotations • Last updated:{" "}
                    {new Date(file.updated_at).toLocaleString()}
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
// Implementation of Intra-class Correlation Coefficient (ICC)
function calculateICC(annotations: string[][]): number {
  // Get the number of raters and subjects
  const numRaters = annotations.length;
  if (numRaters < 2) return 1; // Perfect agreement with single rater

  // Find the minimum length (number of items) across all raters
  const numSubjects = Math.min(...annotations.map((a) => a.length));

  // Align annotations to have the same length
  const alignedAnnotations = annotations.map((a) => a.slice(0, numSubjects));

  // Convert string labels to numeric values for calculation
  const uniqueLabels = Array.from(new Set(alignedAnnotations.flat()));
  const labelMap = new Map(uniqueLabels.map((label, index) => [label, index]));

  const numericAnnotations = alignedAnnotations.map((raterAnnotations) =>
    raterAnnotations.map((label) => labelMap.get(label) as number)
  );

  // Calculate means
  const totalMean =
    numericAnnotations.flat().reduce((sum, val) => sum + val, 0) /
    (numRaters * numSubjects);

  // Calculate subject means
  const subjectMeans = Array(numSubjects).fill(0);
  for (let i = 0; i < numSubjects; i++) {
    for (let j = 0; j < numRaters; j++) {
      subjectMeans[i] += numericAnnotations[j][i];
    }
    subjectMeans[i] /= numRaters;
  }

  // Calculate rater means
  const raterMeans = numericAnnotations.map(
    (raterAnnotations) =>
      raterAnnotations.reduce((sum, val) => sum + val, 0) / numSubjects
  );

  // Calculate sum of squares
  let ssTotal = 0;
  let ssBetweenSubjects = 0;
  let ssBetweenRaters = 0;

  // Total sum of squares
  for (let i = 0; i < numRaters; i++) {
    for (let j = 0; j < numSubjects; j++) {
      ssTotal += Math.pow(numericAnnotations[i][j] - totalMean, 2);
    }
  }

  // Between subjects sum of squares
  for (let i = 0; i < numSubjects; i++) {
    ssBetweenSubjects += numRaters * Math.pow(subjectMeans[i] - totalMean, 2);
  }

  // Between raters sum of squares
  for (let i = 0; i < numRaters; i++) {
    ssBetweenRaters += numSubjects * Math.pow(raterMeans[i] - totalMean, 2);
  }

  // Calculate residual sum of squares
  const ssResidual = ssTotal - ssBetweenSubjects - ssBetweenRaters;

  // Calculate mean squares
  const msBetweenSubjects = ssBetweenSubjects / (numSubjects - 1);
  const msBetweenRaters = ssBetweenRaters / (numRaters - 1);
  const msResidual = ssResidual / ((numSubjects - 1) * (numRaters - 1));

  // Calculate ICC(2,1) - Two-way random effects, absolute agreement, single rater
  const icc =
    (msBetweenSubjects - msResidual) /
    (msBetweenSubjects +
      (numRaters - 1) * msResidual +
      (numRaters / numSubjects) * (msBetweenRaters - msResidual));

  return isNaN(icc) ? 0 : Math.max(0, Math.min(1, icc)); // Bound between 0 and 1
}

// Implementation of Krippendorff's Alpha for multiple annotators
function calculateKrippendorffAlpha(annotations: string[][]): number {
  console.log(annotations);
  const numAnnotators = annotations.length;
  if (numAnnotators < 2) return 1;
  const minLength = Math.min(...annotations.map((a) => a.length));
  const alignedAnnotations = annotations.map((a) => a.slice(0, minLength));
  const uniqueValues = Array.from(new Set(alignedAnnotations.flat()));
  const valueMap = new Map(uniqueValues.map((value, index) => [value, index]));
  const coincidenceMatrix = Array(uniqueValues.length)
    .fill(0)
    .map(() => Array(uniqueValues.length).fill(0));
  for (let i = 0; i < minLength; i++) {
    const itemValues = alignedAnnotations.map((a) => a[i]).filter(Boolean);
    const n = itemValues.length;

    if (n <= 1) continue;

    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (j !== k) {
          const jValue = valueMap.get(itemValues[j])!;
          const kValue = valueMap.get(itemValues[k])!;
          coincidenceMatrix[jValue][kValue] += 1 / (n - 1);
        }
      }
    }
  }
  let n = 0;
  for (const row of coincidenceMatrix) {
    n += row.reduce((sum, val) => sum + val, 0);
  }

  if (n === 0) return 1;

  let observedDisagreement = 0;
  for (let i = 0; i < uniqueValues.length; i++) {
    for (let j = 0; j < uniqueValues.length; j++) {
      if (i !== j) {
        observedDisagreement += coincidenceMatrix[i][j];
      }
    }
  }
  observedDisagreement /= n;
  const valueTotals = coincidenceMatrix.map((row) =>
    row.reduce((sum, cell) => sum + cell, 0)
  );

  const totalSum = valueTotals.reduce((sum, val) => sum + val, 0);

  let expectedDisagreement = 0;
  for (let i = 0; i < uniqueValues.length; i++) {
    for (let j = 0; j < uniqueValues.length; j++) {
      if (i !== j) {
        expectedDisagreement += (valueTotals[i] * valueTotals[j]) / totalSum;
      }
    }
  }
  expectedDisagreement /= totalSum - 1;
  const alpha =
    expectedDisagreement === 0
      ? 1
      : 1 - observedDisagreement / expectedDisagreement;

  return isNaN(alpha) ? 0 : alpha;
}

// Implementation of Fleiss' Kappa for multiple annotators
function calculateFleissKappa(annotations: string[][]): number {
  // Get the number of annotators and items
  const numAnnotators = annotations.length;
  if (numAnnotators < 2) return 1; // Perfect agreement with single annotator

  // Find the minimum length (number of items) across all annotators
  const numItems = Math.min(...annotations.map((a) => a.length));

  // Get all unique categories
  const categories = Array.from(new Set(annotations.flat()));
  const numCategories = categories.length;

  // Create a mapping from category name to index
  const categoryIndices = new Map<string, number>();
  categories.forEach((category, index) => {
    categoryIndices.set(category, index);
  });

  // Initialize the rating matrix:
  // rows = items, columns = categories
  // Each cell contains how many raters assigned that category to that item
  const ratingMatrix = Array(numItems)
    .fill(0)
    .map(() => Array(numCategories).fill(0));

  // Fill the rating matrix
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    for (
      let annotatorIndex = 0;
      annotatorIndex < numAnnotators;
      annotatorIndex++
    ) {
      const category = annotations[annotatorIndex][itemIndex];
      if (category) {
        const categoryIndex = categoryIndices.get(category)!;
        ratingMatrix[itemIndex][categoryIndex]++;
      }
    }
  }

  // Calculate observed agreement (P_i for each item)
  const itemAgreements = ratingMatrix.map((itemRatings) => {
    const sum = itemRatings.reduce((acc, count) => acc + count, 0);
    if (sum <= 1) return 0; // If only one rater rated this item

    // Calculate P_i = sum(n_ij * (n_ij - 1)) / (n_i * (n_i - 1))
    const agreement =
      itemRatings.reduce((acc, count) => {
        return acc + count * (count - 1);
      }, 0) /
      (sum * (sum - 1));

    return agreement;
  });

  // Calculate mean observed agreement (P_o)
  const observedAgreement =
    itemAgreements.reduce((acc, agreement) => acc + agreement, 0) / numItems;

  // Calculate expected agreement (P_e)
  // First, calculate proportion of all ratings in each category
  const categoryProportions = Array(numCategories).fill(0);
  let totalRatings = 0;

  for (const itemRatings of ratingMatrix) {
    for (let j = 0; j < numCategories; j++) {
      categoryProportions[j] += itemRatings[j];
      totalRatings += itemRatings[j];
    }
  }

  // Convert counts to proportions
  for (let j = 0; j < numCategories; j++) {
    categoryProportions[j] /= totalRatings;
  }

  // Calculate P_e = sum(p_j^2)
  const expectedAgreement = categoryProportions.reduce(
    (acc, proportion) => acc + proportion * proportion,
    0
  );

  // Calculate Fleiss' Kappa
  const kappa =
    (observedAgreement - expectedAgreement) / (1 - expectedAgreement);

  return isNaN(kappa) ? 0 : kappa;
}

// Component to render highlighted text with visible labels
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

const AnnotationAnalysisApp: React.FC = () => {
  const [comparisonText, setComparisonText] = useState("");
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const [expandedAnnotator, setExpandedAnnotator] = useState<string | null>(
    null
  );
  const [annotatorAgreement, setAnnotatorAgreement] = useState<{
    alpha?: number;
    fleiss?: number;
    icc?: number;
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

  // Add a function to find matching files across annotators
  const findMatchingFiles = (text: string) => {
    const matches: Record<string, AnnotationFile | null> = {};

    Object.entries(folderAnnotations).forEach(([folder, files]) => {
      // Try to find exact text match
      const match = files.find((file) => file.task.data.text === text);

      matches[folder] = match || null;
    });

    return matches;
  };

  // Add handler for comparison button
  const handleCompareText = (text: string) => {
    const matchingFiles = findMatchingFiles(text);
    setComparisonFiles(matchingFiles);
    setComparisonText(text);
    setIsComparisonModalOpen(true);
  };
  // S3 Configuration
  const s3Client = new S3Client({
    region: "ap-southeast-1",
    credentials: {
      accessKeyId: "AKIAQJDGSPZB3XSTNBGN",
      secretAccessKey: "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",
    },
  });

  const fetchAnnotationFiles = async () => {
    setIsLoading(true);
    try {
      const allFiles: Record<string, AnnotationFile[]> = {};

      // Fetch files from each annotator folder
      for (const folder of Object.keys(ANNOTATORS)) {
        const command = new ListObjectsV2Command({
          Bucket: "corpus-labeling",
          Prefix: `${folder}/`,
        });

        const response = await s3Client.send(command);

        const filePromises =
          response.Contents?.map(async (file) => {
            const getCommand = new GetObjectCommand({
              Bucket: "corpus-labeling",
              Key: file.Key,
            });

            const fileResponse = await s3Client.send(getCommand);
            const fileText = await fileResponse.Body?.transformToString();

            try {
              const parsedFile = JSON.parse(fileText || "{}") as AnnotationFile;
              // Add source folder for tracking
              parsedFile.sourceFolder = folder;
              return parsedFile;
            } catch {
              console.error("Error parsing file:", file.Key);
              return null;
            }
          }) || [];

        const folderFiles = (await Promise.all(filePromises))
          .filter((file): file is AnnotationFile => file !== null)
          .slice(0);

        if (!allFiles[folder]) {
          allFiles[folder] = [];
        }

        allFiles[folder].push(...folderFiles);
      }
      const new_allFiles = sortTextByTaskDataText(allFiles);
      setFolderAnnotations(new_allFiles);
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
      // Extract labels from different annotators
      const annotatorLabels = annotatorKeys.map((folder) =>
        folderAnnotations[folder].flatMap((file) =>
          file.result.map((result) => result.value.labels[0])
        )
      );

      // Calculate both metrics
      const result = {
        alpha: calculateKrippendorffAlpha(annotatorLabels),
        fleiss: calculateFleissKappa(annotatorLabels),
        icc: calculateICC(annotatorLabels),
      };

      setAnnotatorAgreement(result);
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

  useEffect(() => {
    fetchAnnotationFiles();
  }, []);

  const toggleAccordion = (annotator: string) => {
    setExpandedAnnotator(expandedAnnotator === annotator ? null : annotator);
  };

  const interpretAgreement = (value: number) => {
    if (value < 0) return "Độ đồng thuận kém";
    if (value < 0.2) return "Độ đồng thuận rất thấp";
    if (value < 0.4) return "Độ đồng thuận tạm được";
    if (value < 0.6) return "Độ đồng thuận trung bình";
    if (value < 0.8) return "Độ đồng thuận khá cao";
    return "Độ đồng thuận gần như hoàn hảo";
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

      <div className="mb-8">
        <LabelLegend />
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
          {isLoading ? "Data đang load" : "Calculate Agreement"}
        </button>

        {annotatorAgreement !== null && (
          <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
            {/* Display all metrics in a grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Krippendorff's Alpha */}
              <div className="p-3 border rounded-lg bg-blue-50">
                <h3 className="font-bold text-lg text-black">
                  Krippendorff's Alpha
                </h3>
                <div className="text-2xl font-semibold text-blue-600">
                  {annotatorAgreement.alpha?.toFixed(3) || "N/A"}
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  {interpretAgreement(annotatorAgreement.alpha || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Đặc biệt phù hợp cho dữ liệu nhãn có mất mát hoặc không đều
                </p>
              </div>

              {/* Fleiss' Kappa */}
              <div className="p-3 border rounded-lg bg-green-50">
                <h3 className="font-bold text-lg text-black">Fleiss' Kappa</h3>
                <div className="text-2xl font-semibold text-green-600">
                  {annotatorAgreement.fleiss?.toFixed(3) || "N/A"}
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  {interpretAgreement(annotatorAgreement.fleiss || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Phổ biến cho đánh giá độ đồng thuận giữa nhiều người gán nhãn
                </p>
              </div>

              {/* ICC */}
              <div className="p-3 border rounded-lg bg-purple-50">
                <h3 className="font-bold text-lg text-black">
                  Intra-class Correlation (ICC)
                </h3>
                <div className="text-2xl font-semibold text-purple-600">
                  {annotatorAgreement.icc?.toFixed(3) || "N/A"}
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  {interpretAgreement(annotatorAgreement.icc || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Đo lường sự nhất quán và độ tin cậy tuyệt đối
                </p>
              </div>
            </div>

            {/* Add a legend that explains the metrics */}
            <div className="mt-4 pt-3 border-t text-sm">
              <p className="font-medium text-gray-700">Về các thước đo:</p>
              <ul className="mt-2 list-disc pl-5 text-gray-600 space-y-1">
                <li>
                  <span className="font-medium">Krippendorff's Alpha:</span> Phù
                  hợp nhất cho dữ liệu có nhiều annotator và dữ liệu không đầy
                  đủ.
                </li>
                <li>
                  <span className="font-medium">Fleiss' Kappa:</span> Mở rộng
                  của Cohen's Kappa cho nhiều annotator, phù hợp với dữ liệu
                  phân loại.
                </li>
                <li>
                  <span className="font-medium">ICC:</span> Đo lường mức độ nhất
                  quán giữa các đánh giá của cùng một nhóm người đánh giá.
                </li>
              </ul>
              <p className="mt-2 text-gray-500 italic">
                Giá trị từ 0.61-0.80 được coi là độ đồng thuận khá cao, trên
                0.80 là gần như hoàn hảo.
              </p>
            </div>
          </div>
        )}
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                                <span className="font-medium">Updated:</span>{" "}
                                {new Date(file.updated_at).toLocaleString()}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Annotations:
                                </span>{" "}
                                {file.result.length}
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
      />
    </div>
  );
};

export default AnnotationAnalysisApp;
