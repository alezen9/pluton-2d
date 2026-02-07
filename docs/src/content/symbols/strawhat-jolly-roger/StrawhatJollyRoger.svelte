<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = Record<string, never>;

  const mainPathData =
    "M425 246.5c-5.7 1.8-12.4 7.5-15.3 12.9-1.6 3.1-2.2 5.8-2.2 11.6 0 6.7.4 8.1 3.4 13.4l3.3 5.9-4.3 4.1c-22.1 20.7-35.8 33.5-37.9 35.3l-2.5 2.2-6-8c-19-25.8-47.3-43.5-81.5-51.2-13.8-3-41.2-3-55.7.1-33.7 7.3-61.4 24.5-80.9 50.5-4.3 5.6-8.1 10.2-8.5 10.2-.4 0-6.1-5-12.6-11-6.5-6.1-16.1-15.1-21.5-20-9-8.4-9.5-9.1-8.2-11 6.6-9.1 7.7-20.5 2.9-29.3-4.7-8.7-12.7-13.4-23-13.5-3.5 0-7.7.7-10 1.7-8.5 3.6-15.1 13.3-15.9 23.4l-.4 4.7-4.9.6c-24.6 3.1-35 32.7-17.4 49.2 4.9 4.6 12.3 7.7 18.1 7.7 5 0 12.6-3 16.8-6.6l4.2-3.6 4.8 4.4c21.6 19.5 52.2 49.4 51.7 50.6-.3.7-.5 2.7-.5 4.3v2.9H93.5c-29.6 0-32.6.4-35.9 5.1-2.7 3.8-2.1 9.6 1.3 13l2.9 2.9h59.1l.6 3.7c4.2 25.9 13.6 45.8 31.3 66.1 6.2 7.1 18.5 17.5 26.8 22.5 5.9 3.5 6.5 5.3 3.2 9.1-1.3 1.3-18.7 16.5-38.8 33.7-20.1 17.1-37.2 31.8-38.1 32.6-1.4 1.2-2.3 1-6.9-1.9-4.5-2.8-6.4-3.3-12.7-3.6-6.3-.4-8.1-.1-12.7 2.2-14.8 7.3-19.1 27.1-8.6 39.8 3.8 4.6 12.2 8.8 19.1 9.5 5.4.5 5.4.6 5.7 4.1 1.1 15.6 13.4 27.2 28.7 27.2 15.8 0 27.8-11.9 27.7-27.5-.1-6.9-1.6-11.5-5.6-16.2l-2.6-3.1 12.2-11.5c6.8-6.3 13.9-12.8 15.9-14.6l3.7-3.1.7 6.2c1.9 17.2 5 27 12.2 38 21.3 32.6 74.7 43.2 116.3 23.1 18.5-9 31-29 35.5-56.6.8-5 1.6-9.2 1.9-9.4.2-.3 7.8 6.4 16.8 14.8l16.4 15.4-3.2 4.2c-6.3 8.3-6.7 20-1 29.5 9.7 16.3 32.5 17.9 45.4 3.3 4.5-5.1 7.2-11.8 7.2-17.7V625h4.3c14 0 26.7-12.3 26.7-26 0-5-3-12.6-6.6-16.8-9-10.5-25.3-12.3-35.8-3.9l-3 2.4-17.6-15.1c-51.5-44.1-61.6-53.2-63.2-56.1l-1.7-3.2 9.7-6.3c11.7-7.6 28.5-24.1 35.7-35 10.1-15.3 16.9-31.9 19.6-48.3l1.3-7.7h60.8l2.9-2.9c4.1-4.1 4.1-9.8 0-14.3l-2.9-3.3-30.4-.5-30.3-.5-.6-5.8-.6-5.7 8.6-8.4c4.7-4.6 17.4-16.7 28.1-26.9l19.5-18.5 3 2.8c8.2 7.7 19.9 9.5 30 4.5 9.8-4.7 14.9-13.4 14.9-25 0-5.2-.6-8.2-2.3-11.7-4.7-9.6-14.9-16.8-24.2-16.8h-4.6l-.5-6.3c-.8-9.7-5.9-17.6-14-21.8-5.1-2.6-14.1-3.3-19.8-1.4zm20.2 7.1c6.1 4.2 9.1 10.7 9.2 19.6l.1 7.1 7 .1c10.4.3 17.9 5 22.1 14.1 5.8 12.3-.2 27.8-12.3 31.9-9 3.1-15.4 1.5-23-5.7l-5.4-5.1-4.2 4c-2.3 2.2-13.6 13-25.2 23.9-11.5 10.9-22.6 21.4-24.6 23.3l-3.6 3.3-2.7-8.7c-1.5-4.8-4.5-12.5-6.6-17l-3.9-8.4 23.7-22.1c13-12.2 23.8-22.8 24-23.5.2-.8-1-3-2.6-4.8-4-4.6-5.5-9.6-5-16.6.6-7.8 4-12.9 11-16.4 7.3-3.8 15.8-3.4 22 1zm-364.1.5c14.7 4.5 19.6 22.7 9.2 34.8-1.8 2.2-3.3 4.1-3.3 4.4 0 .3 39.6 37.8 46.8 44.2 1 .9.5 2.7-2.3 8.8-2 4.2-4.8 12-6.2 17.2-1.5 5.2-3 9.4-3.4 9.3-.4-.2-13.4-12.4-28.9-27.1l-28.3-26.8-4.6 4.5c-7.9 7.8-16.7 9.7-25.6 5.5C26.2 325 22 317.9 22 308c0-7.3 2.7-13.7 7.8-18.1 5-4.4 9.5-6.1 17.1-6.2l6.5-.2V276c.1-6.3.5-8.2 2.9-12.2 5.4-9.2 14.5-12.7 24.8-9.7zm194.4 22.4c36 5.9 66.4 24.7 86.7 53.5 4.2 6 7.8 12.2 7.8 13.4 0 .3-52.2.6-116.1.6H137.8l3.2-5.7c7.9-14.2 23.1-30.6 37.4-40.2 15.5-10.5 34.8-18.3 53.1-21.5 10.7-1.9 32.8-1.9 44-.1zm171.7 117.7c3 2.4 3.1 5.6.4 8.3l-2.5 2.5H255.8c-150.1 0-189.8-.3-191.8-1.3-3.1-1.6-3.9-6.1-1.4-8.8 1.7-1.9 5.9-1.9 192.4-1.9 151 0 190.9.3 192.2 1.2zM382 412.4c0 11.1-10 36.6-20.2 51.2-17.5 25.4-47.3 44.8-79.8 51.9-11.8 2.6-36.6 3.1-49.1 1-45.6-7.5-83-36.5-99.2-76.7-3.4-8.2-7.7-24.5-7.7-28.7V409h256v3.4zM210.5 516c2.2.7 4.3 1.5 4.7 1.9.7.6-3.9 33.1-4.8 34-1 1.1-30.4-12-30.4-13.6 0-.4 2.1-7.5 4.6-15.9l4.7-15.1 8.6 3.7c4.7 2 10.4 4.3 12.6 5zm111.4 2.4c4.7 11.2 7.2 21.3 5.7 22.5-2 1.7-15.5 7.6-23.8 10.5-7.4 2.5-10.8 3.2-10.8 2 0-.3-1.1-8-2.5-17.1-1.4-9.1-2.3-16.8-2.1-17 .3-.3 5-2 10.5-3.9 5.6-1.8 11.8-4.2 13.8-5.3 4.6-2.4 4.8-2.2 9.2 8.3zm-144.6 12.8c-1.8 6.8-4 16.8-4.9 22.3-3 19.8-.7 16.1-21.6 35.5-10.4 9.5-18.8 17.8-18.8 18.5 0 .6 1.3 2.4 3 3.8 11 9.9 8.1 29.1-5.5 35.7-6.2 3-15.5 3.1-21.2.2-8.8-4.6-13.5-11.9-13.9-21.9-.2-3.5-.5-6.7-.8-7.2-.3-.5-2.6-.6-5.1-.3-6.2.7-12.6-1.4-17.6-5.6-5-4.3-6.9-8.4-6.9-15.2 0-15.1 13.1-25 27.4-20.6 2.7.8 6.4 2.9 8.2 4.7 1.8 1.7 3.9 2.9 4.6 2.6.7-.2 18.1-14.9 38.7-32.6 20.5-17.7 37.4-32.1 37.5-32.1.2 0-1.2 5.5-3.1 12.2zm50.7-10.8c4.1.8 11.2 1.7 15.8 2.1l8.2.7v36.1l-9.2-.6c-7.6-.6-26.4-3.9-27.4-4.9-.2-.2 4.8-34.8 5.1-34.8 0 0 3.4.6 7.5 1.4zm58.1 17.6c1.4 9.6 2.5 17.6 2.4 17.8-.6.7-17.9 3.1-24.5 3.4l-7.5.3-.3-18.1-.2-18.1 11.7-1.2c6.4-.6 11.9-1.4 12.2-1.7.3-.2 1.2-.3 2-.2 1.2.2 2.2 4.4 4.2 17.8zm82.7 18.9c18.3 15.7 33.9 28.7 34.7 28.9.8.2 3.4-1.2 5.6-3.2 7.6-6.5 18.3-6.7 26.9-.6 6.2 4.4 9.8 17.1 7.1 24.3-1.5 3.9-7 9.6-11.4 11.8-2.7 1.4-6.2 2.1-11 2.2l-7.1.2-.1 6.6c-.4 14-10.7 24.7-24.1 24.9-9.1.1-17.7-5.4-21.5-13.5-3.8-8.1-1.5-19.3 5-24.7 1.7-1.5 3.1-3.1 3.1-3.7 0-.5-8.9-9.3-19.9-19.5l-19.8-18.5-.6-12.8c-.5-11.5-3.3-27-6.3-34.8-1-2.4-4.2-5.1 39.4 32.4zm-181-9c4.2 2.1 10.6 4.9 14.2 6.1 3.6 1.3 6.8 2.6 7.2 2.9.6.5-2.4 23.2-3.5 26.3-.6 1.8-25.9-13.1-29.4-17.4-1.5-1.7 1.5-21.8 3.2-21.8.3 0 4 1.7 8.3 3.9zm143.6 10.7.7 9-5.8 4.1c-6.3 4.4-15.3 9.2-23.3 12.3l-5 2-.5-2.3c-.8-3.8-3.5-24-3.3-24.2.2-.1 4.6-1.7 9.8-3.4 5.2-1.7 13.1-4.9 17.5-7 9.4-4.4 8.8-5 9.9 9.5zm-90.7 4.6 11.3 1.2v28.7l-7.2-.6c-10.1-.9-18-2.3-27-4.7-7-1.8-7.7-2.2-7.3-4.2.2-1.1 1.2-7.1 2.1-13.1.9-6.1 1.8-11.3 2-11.6.2-.3 3.6.3 7.6 1.3 3.9 1 12.3 2.3 18.5 3zm50.7 10.4c1 7 1.4 12.9 1 13.4-2.1 1.9-22.7 5.2-33.9 5.5-1.9 0-2-.7-2-14v-14l9.1-.7c5-.4 11.3-1.1 14-1.6 10.6-2.1 9.8-2.9 11.8 11.4zm-108.7 3c13.6 9.3 30.7 15.9 49.2 19 12.7 2 39.3 1.5 51.1-1.1 16.9-3.7 32.6-10.1 43.6-17.5 2.5-1.6 4.6-3 4.7-3 .8 0-1.4 15.7-3.2 23.2-3.8 16.1-12.5 31.3-21.8 38.1-17.5 12.7-45.4 18.4-69.5 14.2-33.1-5.7-53.8-24.3-59.8-53.5-1.8-8.6-2.7-24-1.5-24 .3 0 3.5 2.1 7.2 4.6z";

  const detailPathData =
    "M181 311.7c-6.4 6.6-14 18.3-14 21.6 0 1 .8 1.7 1.9 1.7 1.4 0 3-1.9 5.3-6.3 1.8-3.4 6.6-9.7 10.6-13.9 4.1-4.2 7.1-8.2 6.7-8.8-1.4-2.2-4.2-.7-10.5 5.7zm143.4-1.2c-.3.8 1.1 3.5 3.4 6.2 4.5 5.5 8.5 12.8 10.2 19.1.6 2.4 1.8 4.6 2.6 4.9 6.3 2.4.7-14.8-8.5-26.5-4.2-5.2-6.7-6.4-7.7-3.7zM200 316.1c-3.7 4.1-11 18.2-11 21.5 0 1.2.5 2.6 1 2.9 1.4.8 4-1.3 4-3.2 0-2.2 5.7-13.1 9.1-17.5 2.9-3.6 3-4.1 1.6-5.5-1.4-1.4-1.8-1.3-4.7 1.8zm103.5 5c-.4.5.4 2.7 1.8 4.7s3.1 5.7 3.8 8.2c1.5 5.5 2.1 6.2 4.3 5.4 2.2-.8 1.5-5.7-1.6-11.9-3.4-6.8-6.6-9.2-8.3-6.4zm-86.9 4.2c-3 3.9-4.9 8.6-4.2 10.4.9 2.2 3.6 1.4 4.7-1.4.6-1.6 2.1-4.2 3.5-6 1.3-1.7 2.4-3.9 2.4-4.7 0-2.7-3.8-1.7-6.4 1.7zm-23 97.3c-18.1 5.8-28.8 24.4-24.2 42.4 2.9 11.1 8.8 18.4 19.6 24.1 3.9 2.1 5.9 2.4 14.5 2.4 8.9 0 10.6-.3 15.7-2.8 7.4-3.6 15-11.9 17.8-19.5 3.2-8.5 2.6-20.5-1.4-28.5-7.7-15.1-26.3-23.1-42-18.1zm103.3-.2c-9.9 2.6-18.2 9.7-23.1 19.5-3.3 6.6-3.3 22.4-.1 29.3 3 6.6 10.5 14.3 17.2 17.5 5 2.5 6.7 2.8 15.6 2.8 9.5 0 10.3-.2 16.3-3.4 11.3-6.1 17.8-16.1 18.8-28.8 1.9-24.2-21.1-43.3-44.7-36.9zm-46.6 66.3c-1.2.2-3.6 1.7-5.3 3.3-6.9 6.4-.9 16 10 16 7.1 0 13-4.3 13-9.5 0-7.3-7.9-11.7-17.7-9.8z";

  type GeometryPathBuilder = {
    moveToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineToAbs: (x: number, y: number) => GeometryPathBuilder;
    close: () => GeometryPathBuilder;
  };

  type PathOperation = { kind: "M" | "L"; x: number; y: number } | { kind: "Z" };

  const COMMAND_PATTERN = /^[A-Za-z]$/;
  const NUMBER_PATTERN = /^[+-]?(?:\d+\.\d+|\d+\.?|\.\d+)(?:[eE][+-]?\d+)?$/;
  const TOKEN_PATTERN = /[A-Za-z]|[+-]?(?:\d+\.\d+|\d+\.?|\.\d+)(?:[eE][+-]?\d+)?/g;
  const CURVE_SEGMENTS = 8;

  const toScenePoint = (x: number, y: number): [number, number] => [x - 254, 450 - y];

  const tokenizePathData = (pathData: string): string[] => pathData.match(TOKEN_PATTERN) ?? [];

  const readNumber = (tokens: string[], cursor: { index: number }): number => {
    if (cursor.index >= tokens.length) {
      throw new Error("Unexpected end of SVG path data.");
    }

    const token = tokens[cursor.index++];
    if (!NUMBER_PATTERN.test(token)) {
      throw new Error(`Expected a number token, got "${token}".`);
    }

    const value = Number(token);
    if (Number.isNaN(value)) {
      throw new Error(`Invalid numeric token "${token}".`);
    }

    return value;
  };

  const cubicBezier = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
    const u = 1 - t;
    return u ** 3 * p0 + 3 * u ** 2 * t * p1 + 3 * u * t ** 2 * p2 + t ** 3 * p3;
  };

  const compilePathData = (pathData: string): PathOperation[] => {
    const tokens = tokenizePathData(pathData);
    const operations: PathOperation[] = [];
    const cursor = { index: 0 };

    let command = "";
    let currentX = 0;
    let currentY = 0;
    let subpathStartX = 0;
    let subpathStartY = 0;
    let previousControlX = 0;
    let previousControlY = 0;
    let hasPreviousControl = false;

    const clearPreviousControl = () => {
      hasPreviousControl = false;
    };

    while (cursor.index < tokens.length) {
      const currentToken = tokens[cursor.index];
      if (COMMAND_PATTERN.test(currentToken)) {
        command = currentToken;
        cursor.index++;
      } else if (!command) {
        throw new Error(`Path data must start with a command token, got "${currentToken}".`);
      }

      switch (command) {
        case "M":
        case "m": {
          const relative = command === "m";
          let first = true;
          while (cursor.index < tokens.length && !COMMAND_PATTERN.test(tokens[cursor.index])) {
            const x = readNumber(tokens, cursor);
            const y = readNumber(tokens, cursor);
            const nextX = relative ? currentX + x : x;
            const nextY = relative ? currentY + y : y;
            const [sceneX, sceneY] = toScenePoint(nextX, nextY);

            if (first) {
              operations.push({ kind: "M", x: sceneX, y: sceneY });
              subpathStartX = nextX;
              subpathStartY = nextY;
              command = relative ? "l" : "L";
              first = false;
            } else {
              operations.push({ kind: "L", x: sceneX, y: sceneY });
            }

            currentX = nextX;
            currentY = nextY;
          }
          clearPreviousControl();
          break;
        }

        case "L":
        case "l": {
          const relative = command === "l";
          while (cursor.index < tokens.length && !COMMAND_PATTERN.test(tokens[cursor.index])) {
            const x = readNumber(tokens, cursor);
            const y = readNumber(tokens, cursor);
            currentX = relative ? currentX + x : x;
            currentY = relative ? currentY + y : y;
            const [sceneX, sceneY] = toScenePoint(currentX, currentY);
            operations.push({ kind: "L", x: sceneX, y: sceneY });
          }
          clearPreviousControl();
          break;
        }

        case "H":
        case "h": {
          const relative = command === "h";
          while (cursor.index < tokens.length && !COMMAND_PATTERN.test(tokens[cursor.index])) {
            const x = readNumber(tokens, cursor);
            currentX = relative ? currentX + x : x;
            const [sceneX, sceneY] = toScenePoint(currentX, currentY);
            operations.push({ kind: "L", x: sceneX, y: sceneY });
          }
          clearPreviousControl();
          break;
        }

        case "V":
        case "v": {
          const relative = command === "v";
          while (cursor.index < tokens.length && !COMMAND_PATTERN.test(tokens[cursor.index])) {
            const y = readNumber(tokens, cursor);
            currentY = relative ? currentY + y : y;
            const [sceneX, sceneY] = toScenePoint(currentX, currentY);
            operations.push({ kind: "L", x: sceneX, y: sceneY });
          }
          clearPreviousControl();
          break;
        }

        case "C":
        case "c": {
          const relative = command === "c";
          while (cursor.index < tokens.length && !COMMAND_PATTERN.test(tokens[cursor.index])) {
            const x1 = readNumber(tokens, cursor);
            const y1 = readNumber(tokens, cursor);
            const x2 = readNumber(tokens, cursor);
            const y2 = readNumber(tokens, cursor);
            const x = readNumber(tokens, cursor);
            const y = readNumber(tokens, cursor);

            const control1X = relative ? currentX + x1 : x1;
            const control1Y = relative ? currentY + y1 : y1;
            const control2X = relative ? currentX + x2 : x2;
            const control2Y = relative ? currentY + y2 : y2;
            const endX = relative ? currentX + x : x;
            const endY = relative ? currentY + y : y;

            for (let segment = 1; segment <= CURVE_SEGMENTS; segment++) {
              const t = segment / CURVE_SEGMENTS;
              const curveX = cubicBezier(currentX, control1X, control2X, endX, t);
              const curveY = cubicBezier(currentY, control1Y, control2Y, endY, t);
              const [sceneX, sceneY] = toScenePoint(curveX, curveY);
              operations.push({ kind: "L", x: sceneX, y: sceneY });
            }

            currentX = endX;
            currentY = endY;
            previousControlX = control2X;
            previousControlY = control2Y;
            hasPreviousControl = true;
          }
          break;
        }

        case "S":
        case "s": {
          const relative = command === "s";
          while (cursor.index < tokens.length && !COMMAND_PATTERN.test(tokens[cursor.index])) {
            const x2 = readNumber(tokens, cursor);
            const y2 = readNumber(tokens, cursor);
            const x = readNumber(tokens, cursor);
            const y = readNumber(tokens, cursor);

            const control1X = hasPreviousControl ? 2 * currentX - previousControlX : currentX;
            const control1Y = hasPreviousControl ? 2 * currentY - previousControlY : currentY;
            const control2X = relative ? currentX + x2 : x2;
            const control2Y = relative ? currentY + y2 : y2;
            const endX = relative ? currentX + x : x;
            const endY = relative ? currentY + y : y;

            for (let segment = 1; segment <= CURVE_SEGMENTS; segment++) {
              const t = segment / CURVE_SEGMENTS;
              const curveX = cubicBezier(currentX, control1X, control2X, endX, t);
              const curveY = cubicBezier(currentY, control1Y, control2Y, endY, t);
              const [sceneX, sceneY] = toScenePoint(curveX, curveY);
              operations.push({ kind: "L", x: sceneX, y: sceneY });
            }

            currentX = endX;
            currentY = endY;
            previousControlX = control2X;
            previousControlY = control2Y;
            hasPreviousControl = true;
          }
          break;
        }

        case "Z":
        case "z": {
          operations.push({ kind: "Z" });
          currentX = subpathStartX;
          currentY = subpathStartY;
          clearPreviousControl();
          break;
        }

        default:
          throw new Error(`Unsupported SVG path command "${command}".`);
      }
    }

    return operations;
  };

  const appendOperations = (path: GeometryPathBuilder, operations: PathOperation[]) => {
    for (const operation of operations) {
      if (operation.kind === "M") path.moveToAbs(operation.x, operation.y);
      else if (operation.kind === "L") path.lineToAbs(operation.x, operation.y);
      else path.close();
    }
  };

  const mainPathOps = compilePathData(mainPathData);
  const detailPathOps = compilePathData(detailPathData);

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    const geometry = sceneInstance.geometry.group();

    sceneInstance.draw(() => {
      appendOperations(geometry.path({ className: "demo-jolly-reference", fill: "#000000" }), mainPathOps);
      appendOperations(geometry.path({ className: "demo-jolly-reference", fill: "#000000" }), detailPathOps);
    });
  };
</script>

<ExampleLayout initialParams={{}} {onSetup} />

<style>
  :global(.pluton-root .pluton-geometry path.demo-jolly-reference) {
    stroke: #000000;
    stroke-width: 0.35;
  }
</style>
