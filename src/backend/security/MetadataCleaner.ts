export interface FileMetadata {
  exif?: Record<string, unknown>;
  iptc?: Record<string, unknown>;
  xmp?: Record<string, unknown>;
  author?: string;
  createdAt?: string;
  modifiedAt?: string;
  [key: string]: unknown;
}

export interface MetadataCleanResult {
  cleanedMetadata: FileMetadata;
  removedFields: string[];
}

export class MetadataCleaner {
  scrub(metadata: FileMetadata = {}): MetadataCleanResult {
    const removableKeys = [
      'exif',
      'iptc',
      'xmp',
      'author',
      'creator',
      'createdAt',
      'modifiedAt',
      'producer',
      'pdf:producer',
      'documentId',
      'hiddenLayers',
    ];

    const cleaned: FileMetadata = { ...metadata };
    const removed: string[] = [];

    removableKeys.forEach((key) => {
      if (key in cleaned) {
        delete cleaned[key];
        removed.push(key);
      }
    });

    Object.keys(cleaned).forEach((key) => {
      if (/gps/i.test(key) || /location/i.test(key)) {
        delete cleaned[key];
        removed.push(key);
      }
    });

    return {
      cleanedMetadata: cleaned,
      removedFields: removed,
    };
  }
}
