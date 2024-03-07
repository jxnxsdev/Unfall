export async function analyze_log(backtrace: string) {
    const lines = backtrace.split('\n');
    const responsibleSOs: string[] = [];

    if (lines.length === 0) {
        return ['unknown'];
    }

    if (backtrace.toLowerCase().includes("liveness")) {
        return ['liveness'];
    }

    for (const line of lines) {
        // Check if the line contains information about a shared object (.so)
        if (line.includes('.so')) {
            // Extract the file path between the parentheses
            const startIndex = line.lastIndexOf('/') + 1;
            const endIndex = line.indexOf('(');
            let soFileName = line.substring(startIndex, endIndex);
            soFileName = soFileName.replace(/\s/g, '');
            
            if (soFileName === '' 
            || soFileName === 'libunity.so'
            || soFileName === 'libil2cpp.so'
            || soFileName === 'libmain.so'
            || soFileName === 'libc.so'
            || soFileName === "libmodloader.so"
            || soFileName === "libcodegen.so"
            || soFileName === "libcustom-types.so"
            || soFileName === "libbeatsaber-hook.so"
            || soFileName === "libart.so"
            || responsibleSOs.includes(soFileName)) {
                continue;
            }

            responsibleSOs.push(soFileName);
        }
    }

    // If no responsible .so files were found, check for hook crash
    if (responsibleSOs.length === 0) {
        for (const line of lines) {
            // Check if the line contains the keyword "Hook"
            if (line.includes('Hook')) {
                return ['hook'];
            }
        }
    }

    return responsibleSOs;
}