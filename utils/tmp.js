// This util file provides procedures for dealing with temporary files for storing rate limit data

import fs from "fs";
import path from "path";
import os from "os";

const TEMP_DIR = os.tmpdir()

function writeTempData(data, filename) {
    fs.writeFileSync(path.join(TEMP_DIR, filename), JSON.stringify(data), "utf-8")
}

function readTempData(filename) {
    if (fs.existsSync(path.join(TEMP_DIR, filename))) {
        return JSON.parse(
            fs.readFileSync(path.join(TEMP_DIR, filename), "utf-8")
        );
    }

    // the temp file does not exist
    return;
}

export default {
    writeTempData,
    readTempData
}