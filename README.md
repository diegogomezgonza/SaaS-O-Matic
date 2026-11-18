# SaaS-O-Matic

Herramienta comercial para registrar clientes, simular suscripciones SaaS por tramos y consultar presupuestos en EUR, USD y GBP.

## Ejecutar

Requiere Node.js 22.14 o superior.

```sh
cd saas-o-matic
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. El comando inicia frontend y backend; SQLite se crea automáticamente.

## Contenido de la entrega

- [Código, instrucciones y contrato REST](saas-o-matic/README.md).
- [Espacio de trabajo con IA](ai-workspace/README.md): planificación, arquitectura, prompts reales seleccionados, skills y evidencias de revisión.
- [Registro del proceso](saas-o-matic/proceso-prueba.md).
- [Informe HTML de cobertura](saas-o-matic/coverage-report/index.html) y [PNG](saas-o-matic/coverage-report/coverage.png). Para regenerarlos, ejecutar `npm run test:coverage` dentro de `saas-o-matic`; para servir el HTML, `npm run coverage:serve`.

La raíz del repositorio contiene tanto `saas-o-matic/` como `ai-workspace/`. Entregar ambas carpetas junto con este README y `AGENTS.md` conserva el contexto completo. Los datos de clientes, `node_modules`, temporales y resultados intermedios de tests están excluidos de Git.
