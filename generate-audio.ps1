function New-WavFile {
  param([string]$Path, [int]$SR = 44100, [float[]]$Samples)
  $dataSize = $Samples.Length * 2
  $fs = [System.IO.File]::Create($Path)
  $w = New-Object System.IO.BinaryWriter($fs)
  $w.Write([char[]]'RIFF'); $w.Write([int](36 + $dataSize)); $w.Write([char[]]'WAVE')
  $w.Write([char[]]'fmt '); $w.Write([int]16); $w.Write([short]1); $w.Write([short]1)
  $w.Write([int]$SR); $w.Write([int]($SR * 2)); $w.Write([short]2); $w.Write([short]16)
  $w.Write([char[]]'data'); $w.Write([int]$dataSize)
  foreach ($s in $Samples) {
    $v = [Math]::Max(-1.0, [Math]::Min(1.0, $s))
    $w.Write([short][int]($v * 32767))
  }
  $w.Close(); $fs.Close()
}

$SR = 44100
$rng = [System.Random]::new()

function Noise($len, $amp) { $s = @(); for ($i=0;$i -lt $len;$i++){$s += ($rng.NextDouble()*2-1)*$amp }; return $s }
function Tone($len, $f, $amp) { $s = @(); for ($i=0;$i -lt $len;$i++){$s += [Math]::Sin(2*[Math]::PI*$f*$i/$SR)*$amp }; return $s }
function Sweep($len, $f1, $f2, $amp) { $s = @(); for ($i=0;$i -lt $len;$i++){$f=$f1+($f2-$f1)*$i/$len;$s += [Math]::Sin(2*[Math]::PI*$f*$i/$SR)*$amp*(1-$i/$len)}; return $s }
function Env($s, $a, $r) { $n=$s.Length;$at=[int]($n*$a);$rl=[int]($n*$r);for($i=0;$i -lt $at-and$i -lt $n;$i++){$s[$i]*=$i/$at}for($i=[Math]::Max(0,$n-$rl);$i -lt $n;$i++){$s[$i]*=($n-$i)/$rl};return $s }

Write-Output "Generating ambient..."

$r = Noise($SR*4)0.25; for($i=1;$i -lt $r.Length;$i++){$r[$i]=$r[$i]*0.3+$r[$i-1]*0.7}
New-WavFile "public/assets/audio/ambient/rain.wav" -Samples $r

$h=Tone($SR*4)80 0.08;$h2=Tone($SR*4)160 0.04;$rn=Noise($SR*4)0.02;$rm=@();for($i=0;$i -lt $h.Length;$i++){$rm+=$h[$i]+$h2[$i]+$rn[$i]}
New-WavFile "public/assets/audio/ambient/room.wav" -Samples $rm

$fn=Noise($SR*3)0.15;for($i=2;$i -lt $fn.Length;$i++){$fn[$i]=$fn[$i]*0.15+$fn[$i-1]*0.5+$fn[$i-2]*0.35}
$ft=Tone($SR*3)220 0.05;$fa=@();for($i=0;$i -lt $fn.Length;$i++){$fa+=$fn[$i]+$ft[$i]}
New-WavFile "public/assets/audio/ambient/pc-fan.wav" -Samples $fa

Write-Output "Generating SFX..."

New-WavFile "public/assets/audio/sfx/monitor-on.wav" -Samples (Env (Sweep ($SR*0.4) 200 800 0.3) 0.1 0.3)
New-WavFile "public/assets/audio/sfx/keyboard.wav" -Samples (Env (Noise ($SR*0.04) 0.4) 0.01 0.5)
New-WavFile "public/assets/audio/sfx/mouse-click.wav" -Samples (Env (Noise ($SR*0.02) 0.35) 0.01 0.3)
New-WavFile "public/assets/audio/sfx/mug.wav" -Samples (Env (Tone ($SR*0.12) 3000 0.2) 0.01 0.5)
New-WavFile "public/assets/audio/sfx/book.wav" -Samples (Env (Noise ($SR*0.1) 0.5) 0.01 0.4)
New-WavFile "public/assets/audio/sfx/door.wav" -Samples (Env (Sweep ($SR*0.5) 150 80 0.25) 0.05 0.3)
New-WavFile "public/assets/audio/sfx/server.wav" -Samples (Env (Tone ($SR*0.8) 100 0.2) 0.05 0.3)
New-WavFile "public/assets/audio/sfx/terminal.wav" -Samples (Env (Tone ($SR*0.25) 1200 0.3) 0.05 0.3)
New-WavFile "public/assets/audio/sfx/open.wav" -Samples (Env (Sweep ($SR*0.12) 300 900 0.25) 0.02 0.3)
New-WavFile "public/assets/audio/sfx/close.wav" -Samples (Env (Sweep ($SR*0.12) 900 300 0.2) 0.02 0.3)
New-WavFile "public/assets/audio/sfx/ui-open.wav" -Samples (Env (Tone ($SR*0.15) 660 0.2) 0.02 0.3)
New-WavFile "public/assets/audio/sfx/ui-close.wav" -Samples (Env (Tone ($SR*0.12) 440 0.15) 0.02 0.3)

Write-Output "Done"
