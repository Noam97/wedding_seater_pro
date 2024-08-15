<template>
  <button @click="generateExcel" class="btn-download-excel">
    {{ buttonText }}
  </button>
</template>

<script setup>
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  sheetName: {
    type: String,
    default: 'Sheet1',
  },
  fileName: {
    type: String,
    default: 'Download.xlsx',
  },
  buttonText: {
    type: String,
    default: 'Download Excel',
  },
  headers: {
    type: Array,
    default: () => [],
  }
});

async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('My Sheet', { properties: { tabColor: { argb: 'FFC0000' } } });

  worksheet.views = [{ state: 'normal', rightToLeft: false }];

  // Calculate column widths
  const colWidths = props.headers.map((header, index) => {
    const colData = [header, ...props.data.map(row => row[index])];
    const maxLength = colData.reduce((max, val) => Math.max(max, val ? val.toString().length : 0), 0);
    return { width: maxLength + 2 };
  });

  // Define columns with headers and widths
  worksheet.columns = props.headers.map((header, index) => ({
    header,
    key: header,
    width: colWidths[index].width,
    style: { alignment: { horizontal: 'center' } }
  }));

  // Add data rows
  props.data.forEach(row => {
    const newRow = worksheet.addRow(row);
    // Center alignment for all cells
    newRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { horizontal: 'center', vertical: 'center' };
    });
  });

  // Apply bold styling to the header row
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true };
  });

  // Create and save the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, props.fileName);
}
</script>

<style scoped>
.btn-download-excel {
  background-color: var(--primary-color) !important;
  color: white !important;
  opacity: 1 !important;
  visibility: visible !important;
  transition: none !important;
}
</style>
