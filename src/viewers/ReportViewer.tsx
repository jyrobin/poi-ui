import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Collapse,
  IconButton,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import {
  api,
  ReportSessionResponse,
  ReportCoverageResponse,
  ReportDepsResponse,
  ReportTagsResponse,
  ReportGotchasResponse,
  ReportEntitiesResponse,
  ReportHealthResponse,
} from '../api/client'

export type ReportType = 'session' | 'coverage' | 'deps' | 'tags' | 'gotchas' | 'entities' | 'health'

interface ReportViewerProps {
  reportType: ReportType
  module?: string
}

function ReportSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={28} />
      <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 1 }} />
    </Box>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pass':
    case 'ok':
    case 'documented':
      return <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
    case 'warn':
    case 'stale':
    case 'pending':
      return <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
    case 'fail':
    case 'gap':
    case 'gaps':
    case 'missing':
      return <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
    default:
      return null
  }
}

function GradeChip({ grade, score }: { grade: string; score: number }) {
  const color = grade === 'A' ? 'success' : grade === 'B' ? 'info' : grade === 'C' ? 'warning' : 'error'
  return (
    <Chip
      label={`${grade} (${score}%)`}
      size="small"
      color={color}
      sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}
    />
  )
}

// Collapsible row for nested data
function CollapsibleRow({
  label,
  children,
  defaultOpen = false,
}: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <>
      <TableRow
        onClick={() => setOpen(!open)}
        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      >
        <TableCell colSpan={4} sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" sx={{ p: 0 }}>
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
          <Collapse in={open}>
            <Box sx={{ pl: 4, py: 1 }}>{children}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

function SessionReport({ data }: { data: ReportSessionResponse }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Health Summary */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Health
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GradeChip grade={data.health.grade} score={data.health.score} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {data.health.passing} passing, {data.health.warning} warnings, {data.health.failing} failing
          </Typography>
        </Box>
      </Box>

      {/* Modules Table */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Modules ({data.modules?.length ?? 0})
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Docs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.modules?.map((mod) => (
                <TableRow key={mod.name} hover>
                  <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                    @{mod.name}
                  </TableCell>
                  <TableCell>{mod.type}</TableCell>
                  <TableCell>{mod.status}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StatusIcon status={mod.docs} />
                      <span>{mod.docs}</span>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Suggestions */}
      {data.suggestions && data.suggestions.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Suggestions
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Command</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.suggestions.map((sug, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                      {sug.command}
                    </TableCell>
                    <TableCell>{sug.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Action Items */}
      {data.actionItems && data.actionItems.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Action Items
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {data.actionItems.map((item, i) => (
              <Box component="li" key={i} sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function CoverageReport({ data }: { data: ReportCoverageResponse }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Coverage Summary */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Coverage
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip label={`${data.percent} coverage`} color="primary" />
          <Typography variant="body2">
            {data.documented}/{data.total} documented, {data.pending} pending, {data.missing} missing
          </Typography>
        </Box>
      </Box>

      {/* By Status */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          By Status
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              {Object.entries(data.byStatus || {}).map(([status, modules]) => (
                <CollapsibleRow key={status} label={`${status} (${modules.length})`}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {modules.map((mod) => (
                      <Chip
                        key={mod}
                        label={`@${mod}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </CollapsibleRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Stale */}
      {data.stale && data.stale.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Stale Docs ({data.stale.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  <TableCell>Docs Age</TableCell>
                  <TableCell>Last Code Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.stale.map((row) => (
                  <TableRow key={row.name} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                      @{row.name}
                    </TableCell>
                    <TableCell>{row.docsAge}</TableCell>
                    <TableCell>{row.lastCodeChange}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Gaps */}
      {data.gaps && data.gaps.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Documentation Gaps ({data.gaps.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  <TableCell>Missing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.gaps.map((row) => (
                  <TableRow key={row.module} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                      @{row.module}
                    </TableCell>
                    <TableCell>{row.missing.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

function DepsReport({ data }: { data: ReportDepsResponse }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.module && (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          Dependencies for @{data.module}
        </Typography>
      )}

      {data.uses && data.uses.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Uses ({data.uses.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {data.uses.map((dep) => (
              <Chip
                key={dep}
                label={`@${dep}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {data.usedBy && data.usedBy.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Used By ({data.usedBy.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {data.usedBy.map((dep) => (
              <Chip
                key={dep}
                label={`@${dep}`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {data.external && data.external.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            External ({data.external.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {data.external.map((dep) => (
              <Chip
                key={dep}
                label={dep}
                size="small"
                variant="outlined"
                sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {data.graph && data.graph.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Dependency Graph ({data.graph.length} edges)
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.graph.map((edge, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                      @{edge.from}
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                      @{edge.to}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {data.cycles && data.cycles.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>
            Cycles Detected ({data.cycles.length})
          </Typography>
          {data.cycles.map((cycle, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'error.main' }}>
                {cycle.map((m) => `@${m}`).join(' -> ')}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

function TagsReport({ data }: { data: ReportTagsResponse }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
        Tags ({data.tags?.length ?? 0})
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            {data.tags?.map((tag) => (
              <CollapsibleRow key={tag.tag} label={`${tag.tag} (${tag.count})`}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tag.modules.map((mod) => (
                    <Chip
                      key={mod}
                      label={`@${mod}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </CollapsibleRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

function GotchasReport({ data }: { data: ReportGotchasResponse }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total Gotchas: {data.total}
      </Typography>

      {/* By Module */}
      {data.byModule && Object.keys(data.byModule).length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            By Module
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                {Object.entries(data.byModule).map(([mod, gotchas]) => (
                  <CollapsibleRow key={mod} label={`@${mod} (${gotchas.length})`}>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {gotchas.map((g) => (
                        <Box component="li" key={g.id} sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{g.summary}</Typography>
                          {g.tags && g.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                              {g.tags.map((t) => (
                                <Chip key={t} label={t} size="small" sx={{ height: 16, fontSize: '0.625rem' }} />
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CollapsibleRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Patterns */}
      {data.patterns && data.patterns.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Patterns
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pattern</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Modules</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.patterns.map((p) => (
                  <TableRow key={p.pattern} hover>
                    <TableCell>{p.pattern}</TableCell>
                    <TableCell>{p.count}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {p.modules.slice(0, 3).map((m) => (
                          <Chip
                            key={m}
                            label={`@${m}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.625rem' }}
                          />
                        ))}
                        {p.modules.length > 3 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            +{p.modules.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

function EntitiesReport({ data }: { data: ReportEntitiesResponse }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total Entities: {data.total}
      </Typography>

      {data.byModule && Object.keys(data.byModule).length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              {Object.entries(data.byModule).map(([mod, entities]) => (
                <CollapsibleRow key={mod} label={`@${mod} (${entities.length})`}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>File</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entities.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' }}>
                            {e.name}
                          </TableCell>
                          <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: 'text.secondary' }}>
                            {e.file}
                          </TableCell>
                          <TableCell>{e.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CollapsibleRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

function HealthReport({ data }: { data: ReportHealthResponse }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Health Score */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <GradeChip grade={data.grade} score={data.score} />
      </Box>

      {/* Health Checks */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Checks ({data.checks?.length ?? 0})
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={32}></TableCell>
                <TableCell>Check</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.checks?.map((check, i) => (
                <TableRow key={i} hover>
                  <TableCell>
                    <StatusIcon status={check.status} />
                  </TableCell>
                  <TableCell>{check.name}</TableCell>
                  <TableCell>{check.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Action Items */}
      {data.actionItems && data.actionItems.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Action Items
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {data.actionItems.map((item, i) => (
              <Box component="li" key={i} sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default function ReportViewer({ reportType, module }: ReportViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<unknown>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchReport = async () => {
      try {
        let result: unknown
        switch (reportType) {
          case 'session':
            result = await api.getReportSession()
            break
          case 'coverage':
            result = await api.getReportCoverage(module)
            break
          case 'deps':
            result = await api.getReportDeps({ module, graph: !module, cycles: !module })
            break
          case 'tags':
            result = await api.getReportTags()
            break
          case 'gotchas':
            result = await api.getReportGotchas({ module, patterns: true })
            break
          case 'entities':
            result = await api.getReportEntities({ module })
            break
          case 'health':
            result = await api.getReportHealth(module)
            break
        }
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportType, module])

  if (loading) return <ReportSkeleton />

  if (error) {
    return (
      <Typography variant="body2" sx={{ color: 'error.main', p: 2 }}>
        {error}
      </Typography>
    )
  }

  if (!data) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
        No data available
      </Typography>
    )
  }

  switch (reportType) {
    case 'session':
      return <SessionReport data={data as ReportSessionResponse} />
    case 'coverage':
      return <CoverageReport data={data as ReportCoverageResponse} />
    case 'deps':
      return <DepsReport data={data as ReportDepsResponse} />
    case 'tags':
      return <TagsReport data={data as ReportTagsResponse} />
    case 'gotchas':
      return <GotchasReport data={data as ReportGotchasResponse} />
    case 'entities':
      return <EntitiesReport data={data as ReportEntitiesResponse} />
    case 'health':
      return <HealthReport data={data as ReportHealthResponse} />
    default:
      return null
  }
}
