const items = [
            "اڤوگادوو", "برتەقال", "لیمون", "سندی", "هنار", "موز", "سيڤ",
            "گيزەر", "خوخ", "مانگو", "اناناس", "تیشەمبی", "هیژیر", "فراولە",
            "حلیک", "مشمش", "بهـ", "کاکی", "هرمیک", "زەبەش", "گندور"
        ];

        function renderTables() {
            const body = document.getElementById("table-body");

            const createRow = (item) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="item-name">${item}</td>
                    <td><input type="text" class="custom-item-input qty-input" placeholder="اكتب الكمية..."></td>
                    <td><input type="text" class="custom-item-input note-input" placeholder="ملاحظة..."></td>
                `;
                return tr;
            };
            items.forEach(item => body.appendChild(createRow(item)));
        }

        function prefillToday() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            document.getElementById("cust-date").value = `${yyyy}-${mm}-${dd}`;
        }

        renderTables();
        prefillToday();

        async function generatePDF() {
            const exportBtn = document.querySelector(".export-btn");
            const element = document.getElementById("invoice-container");

            if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
                alert("تکایە دڵنیابەرەوە لە هەبوونی ئینتەرنێت بۆ بارکردنی کتێبخانەی PDF.");
                return;
            }

            exportBtn.disabled = true;
            exportBtn.innerText = "چاوەڕوان بە...";

            element.classList.add("pdf-mode");
            const inputs = element.querySelectorAll('input');
            const tempSpans = [];

            inputs.forEach(input => {
                const span = document.createElement('span');
                span.className = 'pdf-temp-text';
                span.textContent = input.value || ''; 
                input.style.display = 'none';
                input.parentNode.appendChild(span);
                tempSpans.push({ input, span });
            });

            try {
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                const canvas = await html2canvas(element, {
                    scale: 3, 
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    scrollX: 0,
                    scrollY: 0
                });

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const canvasRatio = canvas.height / canvas.width;

                let imgWidth = pageWidth;
                let imgHeight = imgWidth * canvasRatio;

                if (imgHeight > pageHeight) {
                    imgHeight = pageHeight;
                    imgWidth = imgHeight / canvasRatio;
                }

                const x = (pageWidth - imgWidth) / 2;
                const y = 0; 

                const imageData = canvas.toDataURL("image/jpeg", 0.98);
                pdf.addImage(imageData, "JPEG", x, y, imgWidth, imgHeight);
                pdf.save("Organic-Juices-Order.pdf");

            } catch (error) {
                console.error("PDF Export Error:", error);
                alert("هەڵەیەک ڕووی دا لە کاتی دروستکردنی PDF.");
            } finally {
                tempSpans.forEach(({ input, span }) => {
                    input.style.display = '';
                    if (span.parentNode) {
                        span.parentNode.removeChild(span);
                    }
                });

                element.classList.remove("pdf-mode");
                exportBtn.disabled = false;
                exportBtn.innerText = "تصدير الفاتورة (PDF)";
            }
        }
        // xo bezhe naka hhhhh